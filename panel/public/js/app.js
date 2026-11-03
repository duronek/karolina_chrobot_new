/**
 * Panel Zarządzania Pracami – Frontend Vanilla JS
 * Zgodny z wytycznymi: Factory Functions, Object.freeze(), const/let, arrow functions.
 */

/**
 * Klient API do komunikacji z serwerem Express.
 */
const createApiClient = () => {
  const fetchPrace = async (kategoria) => {
    const res = await fetch(`/api/prace?kategoria=${encodeURIComponent(kategoria)}`);
    return await res.json();
  };

  const dodajPrace = async (formData) => {
    const res = await fetch('/api/prace', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  };

  const aktualizujPrace = async (dane) => {
    const res = await fetch('/api/prace', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dane)
    });
    return await res.json();
  };

  const usunPrace = async (kategoria, zdjecie, usunPlik) => {
    const res = await fetch('/api/prace', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kategoria, zdjecie, usunPlik })
    });
    return await res.json();
  };

  const zapiszKolejnosc = async (kategoria, zdjecia) => {
    const res = await fetch('/api/kolejnosc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kategoria, zdjecia })
    });
    return await res.json();
  };

  const getDevStatus = async () => {
    const res = await fetch('/api/dev/status');
    return await res.json();
  };

  const startDev = async () => {
    const res = await fetch('/api/dev/start', { method: 'POST' });
    return await res.json();
  };

  const stopDev = async () => {
    const res = await fetch('/api/dev/stop', { method: 'POST' });
    return await res.json();
  };

  const runDeploy = async () => {
    const res = await fetch('/api/deploy', { method: 'POST' });
    return await res.json();
  };

  return Object.freeze({
    fetchPrace,
    dodajPrace,
    aktualizujPrace,
    usunPrace,
    zapiszKolejnosc,
    getDevStatus,
    startDev,
    stopDev,
    runDeploy
  });
};

/**
 * Fabryka obsługi powiadomień Toast.
 */
const createToastManager = () => {
  const elToast = document.getElementById('toastPowiadomienie');
  const elTresc = document.getElementById('toastTresc');
  const bsToast = elToast && window.bootstrap ? new window.bootstrap.Toast(elToast, { delay: 3500 }) : null;

  const pokaz = (tekst, typ = 'success') => {
    if (!elToast || !bsToast) return;
    const ikona = typ === 'success' ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger';
    elTresc.innerHTML = `<i class="fa-solid ${ikona}"></i> ${tekst}`;
    bsToast.show();
  };

  return Object.freeze({
    pokaz
  });
};

/**
 * Fabryka kontrolera głównego interfejsu aplikacji.
 */
const createAppController = (api, toast) => {
  let aktualnaKategoria = 'obrazy';
  let listaPrac = [];
  let przefiltrowanePrace = [];
  let filtrTekst = '';

  let pracaDoEdycji = null;
  let pracaDoUsuniecia = null;
  let dragSrcIndex = null;

  // Modale Bootstrap
  const modalDodaj = new window.bootstrap.Modal(document.getElementById('modalDodaj'));
  const modalEdytuj = new window.bootstrap.Modal(document.getElementById('modalEdytuj'));
  const modalUsun = new window.bootstrap.Modal(document.getElementById('modalUsun'));
  const modalDev = new window.bootstrap.Modal(document.getElementById('modalDev'));
  const modalDeploy = new window.bootstrap.Modal(document.getElementById('modalDeploy'));

  // Elementy DOM
  const elLista = document.getElementById('listaPrac');
  const elLoader = document.getElementById('loader');
  const elBrakWynikow = document.getElementById('brakWynikow');
  const elInputSzukaj = document.getElementById('inputSzukaj');
  const elBtnWyczyscSzukaj = document.getElementById('btnWyczyscSzukaj');
  const elNaglowekKategorii = document.getElementById('naglowekKategorii');
  const elLicznikWszystkich = document.getElementById('licznikWszystkich');
  const elLicznikWyroznionych = document.getElementById('licznikWyroznionych');
  const elLicznikUkrytych = document.getElementById('licznikUkrytych');
  const elBadgeDevStatus = document.getElementById('badgeDevStatus');

  /**
   * Ładuje prace z serwera dla bieżącej kategorii.
   */
  const wczytajDane = async () => {
    elLoader.classList.remove('d-none');
    elLista.classList.add('d-none');
    elBrakWynikow.classList.add('d-none');

    try {
      const resp = await api.fetchPrace(aktualnaKategoria);
      if (resp.sukces) {
        listaPrac = [...resp.prace];
        zastosujFiltr();
      } else {
        toast.pokaz(`Błąd wczytywania: ${resp.blad}`, 'danger');
      }
    } catch (err) {
      toast.pokaz(`Błąd sieci: ${err.message}`, 'danger');
    } finally {
      elLoader.classList.add('d-none');
      elLista.classList.remove('d-none');
    }
  };

  /**
   * Filtruje listę prac na podstawie wpisanego tekstu w wyszukiwarce.
   */
  const zastosujFiltr = () => {
    if (!filtrTekst.trim()) {
      przefiltrowanePrace = [...listaPrac];
    } else {
      const q = filtrTekst.toLowerCase().trim();
      przefiltrowanePrace = listaPrac.filter((p) => {
        return (
          p.tytul.toLowerCase().includes(q) ||
          p.technika.toLowerCase().includes(q) ||
          p.wymiary.toLowerCase().includes(q) ||
          p.rok.toLowerCase().includes(q) ||
          p.opis.toLowerCase().includes(q) ||
          p.nazwaPliku.toLowerCase().includes(q)
        );
      });
    }

    aktualizujLiczniki();
    renderujListe();
  };

  /**
   * Aktualizuje liczniki w nagłówku.
   */
  const aktualizujLiczniki = () => {
    const lacznie = listaPrac.length;
    const wyroznione = listaPrac.filter((p) => p.wyrozniony).length;
    const ukryte = listaPrac.filter((p) => p.ukryty).length;

    elLicznikWszystkich.textContent = lacznie;
    elLicznikWyroznionych.textContent = wyroznione;
    elLicznikUkrytych.textContent = ukryte;

    const ikony = {
      obrazy: 'fa-paintbrush text-primary',
      aranzacje: 'fa-couch text-success',
      dyplomy: 'fa-award text-warning'
    };
    const nazwy = {
      obrazy: 'Obrazy',
      aranzacje: 'Aranżacje',
      dyplomy: 'Dyplomy i Nagrody'
    };

    elNaglowekKategorii.innerHTML = `<i class="fa-solid ${ikony[aktualnaKategoria] || 'fa-folder'}"></i> ${nazwy[aktualnaKategoria] || aktualnaKategoria}`;
  };

  /**
   * Renderuje karty prac w kontenerze flexbox.
   */
  const renderujListe = () => {
    elLista.innerHTML = '';

    if (przefiltrowanePrace.length === 0) {
      elBrakWynikow.classList.remove('d-none');
      return;
    }

    elBrakWynikow.classList.add('d-none');
    const czyJestFiltr = filtrTekst.trim().length > 0;

    przefiltrowanePrace.forEach((praca, idx) => {
      // Indeks w pełnej liście (ważny dla kolejności)
      const indexWList = listaPrac.findIndex((p) => p.zdjecie === praca.zdjecie);

      const karta = document.createElement('div');
      karta.className = `praca-karta shadow-sm ${praca.ukryty ? 'ukryta' : ''}`;
      karta.setAttribute('draggable', czyJestFiltr ? 'false' : 'true');
      karta.dataset.index = indexWList;
      karta.dataset.zdjecie = praca.zdjecie;

      // Odznaki
      const odznakiHtml = [];
      if (praca.wyrozniony) {
        odznakiHtml.push(`<span class="badge bg-warning text-dark"><i class="fa-solid fa-star"></i> Wyróżniony</span>`);
      }
      if (praca.ukryty) {
        odznakiHtml.push(`<span class="badge bg-secondary"><i class="fa-solid fa-eye-slash"></i> Ukryty</span>`);
      }
      if (!praca.plikIstnieje) {
        odznakiHtml.push(`<span class="badge bg-danger"><i class="fa-solid fa-triangle-exclamation"></i> Brak pliku</span>`);
      }

      const szczegolyTekst = [praca.technika, praca.wymiary, praca.rok].filter(Boolean).join(' • ');

      karta.innerHTML = `
        <div class="praca-sekcja-lewa">
          <div class="praca-uchwyt" title="${czyJestFiltr ? 'Sortowanie wyłączone podczas filtrowania' : 'Przeciągnij, aby zmienić kolejność'}">
            <i class="fa-solid fa-grip-vertical"></i>
          </div>
          <div class="praca-numer" title="Pozycja w galerii">
            #${indexWList + 1}
          </div>
          <div class="praca-miniaturka-box" title="Kliknij, aby otworzyć zdjęcie w nowej karcie">
            <img src="${praca.zdjecie}" alt="${praca.tytul || 'Obraz'}" class="praca-miniaturka-img" loading="lazy">
          </div>
          <div class="praca-dane">
            <div class="praca-tytul-wiersz">
              <h2 class="praca-tytul">${praca.tytul || '<em class="text-muted">Bez tytułu</em>'}</h2>
              ${odznakiHtml.join(' ')}
            </div>
            ${szczegolyTekst ? `<div class="praca-szczegoly">${szczegolyTekst}</div>` : ''}
            ${praca.opis ? `<div class="praca-opis">${praca.opis}</div>` : ''}
          </div>
        </div>

        <div class="praca-sekcja-prawa">
          <!-- Przyciski zmiany kolejności -->
          <div class="praca-nawigacja-kolejnosci">
            <button type="button" class="btn btn-sm btn-light btn-top" title="Przenieś na samą górę galerii" ${indexWList === 0 || czyJestFiltr ? 'disabled' : ''}>
              <i class="fa-solid fa-angles-up"></i>
            </button>
            <button type="button" class="btn btn-sm btn-light btn-up" title="Przesuń wyżej" ${indexWList === 0 || czyJestFiltr ? 'disabled' : ''}>
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button type="button" class="btn btn-sm btn-light btn-down" title="Przesuń niżej" ${indexWList === listaPrac.length - 1 || czyJestFiltr ? 'disabled' : ''}>
              <i class="fa-solid fa-arrow-down"></i>
            </button>
            <button type="button" class="btn btn-sm btn-light btn-bottom" title="Przenieś na sam dół galerii" ${indexWList === listaPrac.length - 1 || czyJestFiltr ? 'disabled' : ''}>
              <i class="fa-solid fa-angles-down"></i>
            </button>
          </div>

          <!-- Edycja i Usuwanie -->
          <button type="button" class="btn btn-sm btn-outline-primary btn-edit" title="Edytuj dane pracy">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger btn-delete" title="Usuń pracę">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      // Event listenery dla przycisków w karcie
      const imgBox = karta.querySelector('.praca-miniaturka-box');
      imgBox.addEventListener('click', () => window.open(praca.zdjecie, '_blank'));

      const btnTop = karta.querySelector('.btn-top');
      btnTop.addEventListener('click', () => przeniesElement(indexWList, 0));

      const btnUp = karta.querySelector('.btn-up');
      btnUp.addEventListener('click', () => przeniesElement(indexWList, indexWList - 1));

      const btnDown = karta.querySelector('.btn-down');
      btnDown.addEventListener('click', () => przeniesElement(indexWList, indexWList + 1));

      const btnBottom = karta.querySelector('.btn-bottom');
      btnBottom.addEventListener('click', () => przeniesElement(indexWList, listaPrac.length - 1));

      const btnEdit = karta.querySelector('.btn-edit');
      btnEdit.addEventListener('click', () => otworzModalEdycji(praca));

      const btnDelete = karta.querySelector('.btn-delete');
      btnDelete.addEventListener('click', () => otworzModalUsuniecia(praca));

      // Obsługa Drag & Drop (tylko gdy brak filtru tekstowego)
      if (!czyJestFiltr) {
        karta.addEventListener('dragstart', (e) => {
          dragSrcIndex = indexWList;
          karta.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        karta.addEventListener('dragend', () => {
          karta.classList.remove('dragging');
          document.querySelectorAll('.praca-karta').forEach((el) => el.classList.remove('drag-over'));
        });

        karta.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          karta.classList.add('drag-over');
        });

        karta.addEventListener('dragleave', () => {
          karta.classList.remove('drag-over');
        });

        karta.addEventListener('drop', (e) => {
          e.stopPropagation();
          karta.classList.remove('drag-over');
          if (dragSrcIndex !== null && dragSrcIndex !== indexWList) {
            przeniesElement(dragSrcIndex, indexWList);
          }
        });
      }

      elLista.appendChild(karta);
    });
  };

  /**
   * Zmienia kolejność elementu w tablicy i wysyła nową listę do API.
   */
  const przeniesElement = async (staryIndex, nowyIndex) => {
    if (nowyIndex < 0 || nowyIndex >= listaPrac.length || staryIndex === nowyIndex) return;

    const [przenoszona] = listaPrac.splice(staryIndex, 1);
    listaPrac.splice(nowyIndex, 0, przenoszona);

    zastosujFiltr();

    // Zapisz na serwerze
    const tablicaZdjec = listaPrac.map((p) => p.zdjecie);
    try {
      const wynik = await api.zapiszKolejnosc(aktualnaKategoria, tablicaZdjec);
      if (wynik.sukces) {
        toast.pokaz(`Zapisano nową kolejność (${przenoszona.tytul || 'pracy'} na #${nowyIndex + 1})`, 'success');
      } else {
        toast.pokaz(`Błąd zapisu kolejności: ${wynik.blad}`, 'danger');
      }
    } catch (err) {
      toast.pokaz(`Błąd sieci: ${err.message}`, 'danger');
    }
  };

  /**
   * Otwiera modal edycji z wypełnionymi danymi wybranej pracy.
   */
  const otworzModalEdycji = (praca) => {
    pracaDoEdycji = praca;
    document.getElementById('editZdjecie').value = praca.zdjecie;
    document.getElementById('editTytul').value = praca.tytul;
    document.getElementById('editTechnika').value = praca.technika;
    document.getElementById('editWymiary').value = praca.wymiary;
    document.getElementById('editRok').value = praca.rok;
    document.getElementById('editOpis').value = praca.opis;
    document.getElementById('editWyrozniony').checked = praca.wyrozniony;
    document.getElementById('editUkryty').checked = praca.ukryty;

    document.getElementById('editPodgladZdjecia').src = praca.zdjecie;
    document.getElementById('editSciezkaZdjecia').textContent = praca.zdjecie;

    modalEdytuj.show();
  };

  /**
   * Otwiera modal potwierdzenia usunięcia.
   */
  const otworzModalUsuniecia = (praca) => {
    pracaDoUsuniecia = praca;
    document.getElementById('usunPodgladZdjecia').src = praca.zdjecie;
    document.getElementById('usunTytulPracy').textContent = praca.tytul || 'Praca bez tytułu';
    document.getElementById('usunSciezkaPracy').textContent = praca.zdjecie;
    document.getElementById('checkUsunPlikZDysku').checked = true;

    modalUsun.show();
  };

  /**
   * Inicjalizacja event listenerów formularzy i przycisków.
   */
  const bindEvents = () => {
    // Zmiana kategorii
    const navKategorie = document.getElementById('navKategorie');
    navKategorie.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-kat]');
      if (!btn) return;

      navKategorie.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      aktualnaKategoria = btn.dataset.kat;
      filtrTekst = '';
      elInputSzukaj.value = '';
      wczytajDane();
    });

    // Wyszukiwarka
    elInputSzukaj.addEventListener('input', (e) => {
      filtrTekst = e.target.value;
      zastosujFiltr();
    });

    elBtnWyczyscSzukaj.addEventListener('click', () => {
      elInputSzukaj.value = '';
      filtrTekst = '';
      zastosujFiltr();
      elInputSzukaj.focus();
    });

    // Otwarcie modalu Dodaj
    const btnOtworzDodaj = document.getElementById('btnOtworzDodaj');
    const btnDodajPusty = document.getElementById('btnDodajPustyStan');
    const otworzDodajFn = () => {
      document.getElementById('formularzDodaj').reset();
      document.getElementById('podgladNowegoZdjecia').src = '';
      document.getElementById('podgladNowegoZdjecia').classList.add('d-none');
      document.getElementById('ikonaDropzone').classList.remove('d-none');
      document.getElementById('tekstDropzone').classList.remove('d-none');
      modalDodaj.show();
    };
    btnOtworzDodaj.addEventListener('click', otworzDodajFn);
    if (btnDodajPusty) btnDodajPusty.addEventListener('click', otworzDodajFn);

    // Podgląd wybranego pliku w modalu dodawania
    const inputPlikNowy = document.getElementById('inputPlikNowy');
    const imgPodglad = document.getElementById('podgladNowegoZdjecia');
    const ikonaDrop = document.getElementById('ikonaDropzone');
    const tekstDrop = document.getElementById('tekstDropzone');

    inputPlikNowy.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imgPodglad.src = event.target.result;
          imgPodglad.classList.remove('d-none');
          ikonaDrop.classList.add('d-none');
          tekstDrop.classList.add('d-none');
        };
        reader.readAsDataURL(file);
      }
    });

    // Zapis nowej pracy
    const formDodaj = document.getElementById('formularzDodaj');
    const btnZapiszNowy = document.getElementById('btnZapiszNowy');

    formDodaj.addEventListener('submit', async (e) => {
      e.preventDefault();
      btnZapiszNowy.disabled = true;
      btnZapiszNowy.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Zapisywanie...`;

      const formData = new FormData(formDodaj);
      formData.append('kategoria', aktualnaKategoria);

      try {
        const resp = await api.dodajPrace(formData);
        if (resp.sukces) {
          modalDodaj.hide();
          toast.pokaz(`Pomyślnie dodano pracę: ${resp.praca.tytul || 'Nowa praca'}`, 'success');
          await wczytajDane();
        } else {
          toast.pokaz(`Błąd dodawania: ${resp.blad}`, 'danger');
        }
      } catch (err) {
        toast.pokaz(`Błąd sieci: ${err.message}`, 'danger');
      } finally {
        btnZapiszNowy.disabled = false;
        btnZapiszNowy.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Zapisz i dodaj`;
      }
    });

    // Zapis edycji pracy
    const formEdytuj = document.getElementById('formularzEdytuj');
    const btnZapiszEdycje = document.getElementById('btnZapiszEdycje');

    formEdytuj.addEventListener('submit', async (e) => {
      e.preventDefault();
      btnZapiszEdycje.disabled = true;
      btnZapiszEdycje.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Zapisywanie...`;

      const payload = {
        kategoria: aktualnaKategoria,
        zdjecie: document.getElementById('editZdjecie').value,
        tytul: document.getElementById('editTytul').value,
        technika: document.getElementById('editTechnika').value,
        wymiary: document.getElementById('editWymiary').value,
        rok: document.getElementById('editRok').value,
        opis: document.getElementById('editOpis').value,
        wyrozniony: document.getElementById('editWyrozniony').checked,
        ukryty: document.getElementById('editUkryty').checked
      };

      try {
        const resp = await api.aktualizujPrace(payload);
        if (resp.sukces) {
          modalEdytuj.hide();
          toast.pokaz('Zaktualizowano dane pracy.', 'success');
          await wczytajDane();
        } else {
          toast.pokaz(`Błąd edycji: ${resp.blad}`, 'danger');
        }
      } catch (err) {
        toast.pokaz(`Błąd sieci: ${err.message}`, 'danger');
      } finally {
        btnZapiszEdycje.disabled = false;
        btnZapiszEdycje.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Zapisz zmiany`;
      }
    });

    // Potwierdzenie usunięcia pracy
    const btnPotwierdzUsun = document.getElementById('btnPotwierdzUsun');
    btnPotwierdzUsun.addEventListener('click', async () => {
      if (!pracaDoUsuniecia) return;

      btnPotwierdzUsun.disabled = true;
      btnPotwierdzUsun.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Usuwanie...`;
      const usunPlik = document.getElementById('checkUsunPlikZDysku').checked;

      try {
        const resp = await api.usunPrace(aktualnaKategoria, pracaDoUsuniecia.zdjecie, usunPlik);
        if (resp.sukces) {
          modalUsun.hide();
          toast.pokaz(
            `Praca została usunięta${resp.wynik.usunietoPlik ? ' wraz z plikiem z dysku' : ''}.`,
            'success'
          );
          await wczytajDane();
        } else {
          toast.pokaz(`Błąd podczas usuwania: ${resp.blad}`, 'danger');
        }
      } catch (err) {
        toast.pokaz(`Błąd sieci: ${err.message}`, 'danger');
      } finally {
        btnPotwierdzUsun.disabled = false;
        btnPotwierdzUsun.innerHTML = `<i class="fa-solid fa-trash-can"></i> Tak, usuń`;
      }
    });

    // Obsługa Dev Serwera (Podgląd)
    const btnDevModal = document.getElementById('btnDevModal');
    const devStatusDot = document.getElementById('devStatusDot');
    const devStatusTekst = document.getElementById('devStatusTekst');
    const btnDevStart = document.getElementById('btnDevStart');
    const btnDevStop = document.getElementById('btnDevStop');
    const devConsoleLog = document.getElementById('devConsoleLog');

    const odswiezDevStatus = async () => {
      try {
        const status = await api.getDevStatus();
        if (status.isRunning) {
          devStatusDot.classList.add('active');
          devStatusTekst.innerHTML = '<span class="text-success">Serwer podglądu jest aktywny</span>';
          elBadgeDevStatus.className = 'badge bg-success';
          elBadgeDevStatus.textContent = 'Aktywny';
          btnDevStart.disabled = true;
          btnDevStop.disabled = false;
        } else {
          devStatusDot.classList.remove('active');
          devStatusTekst.innerHTML = '<span class="text-secondary">Serwer podglądu jest zatrzymany</span>';
          elBadgeDevStatus.className = 'badge bg-secondary';
          elBadgeDevStatus.textContent = 'Wyłączony';
          btnDevStart.disabled = false;
          btnDevStop.disabled = true;
        }

        if (status.logs && status.logs.length) {
          devConsoleLog.textContent = status.logs.join('');
          devConsoleLog.scrollTop = devConsoleLog.scrollHeight;
        }
      } catch (e) {
        console.error('Błąd sprawdzania statusu dev:', e);
      }
    };

    btnDevModal.addEventListener('click', () => {
      odswiezDevStatus();
      modalDev.show();
    });

    btnDevStart.addEventListener('click', async () => {
      btnDevStart.disabled = true;
      try {
        await api.startDev();
        toast.pokaz('Uruchamianie serwera podglądu...', 'success');
        setTimeout(odswiezDevStatus, 1500);
      } catch (err) {
        toast.pokaz(`Błąd uruchamiania: ${err.message}`, 'danger');
      }
    });

    btnDevStop.addEventListener('click', async () => {
      btnDevStop.disabled = true;
      try {
        await api.stopDev();
        toast.pokaz('Zatrzymano serwer podglądu.', 'success');
        setTimeout(odswiezDevStatus, 500);
      } catch (err) {
        toast.pokaz(`Błąd zatrzymywania: ${err.message}`, 'danger');
      }
    });

    // Sprawdzaj status podglądu co 5 sekund
    setInterval(odswiezDevStatus, 5000);
    odswiezDevStatus();

    // Obsługa Deploy na Cloudflare
    const btnDeployModal = document.getElementById('btnDeployModal');
    const btnUruchomDeploy = document.getElementById('btnUruchomDeploy');
    const deploySpinner = document.getElementById('deploySpinner');
    const deployStatusIkona = document.getElementById('deployStatusIkona');
    const deployStatusTytul = document.getElementById('deployStatusTytul');
    const deployStatusOpis = document.getElementById('deployStatusOpis');
    const deployLogBox = document.getElementById('deployLogBox');
    const btnDeployAnuluj = document.getElementById('btnDeployAnuluj');
    const btnDeployZamknijX = document.getElementById('btnDeployZamknijX');

    btnDeployModal.addEventListener('click', () => {
      deployStatusIkona.className = 'fa-solid fa-circle-question fa-2x text-muted';
      deployStatusIkona.classList.remove('d-none');
      deploySpinner.classList.add('d-none');
      deployStatusTytul.textContent = 'Gotowy do publikacji';
      deployStatusOpis.textContent = 'Kliknij poniższy przycisk, aby rozpocząć proces wdrożenia.';
      deployLogBox.textContent = 'Oczekiwanie na uruchomienie...';
      btnUruchomDeploy.disabled = false;
      modalDeploy.show();
    });

    btnUruchomDeploy.addEventListener('click', async () => {
      btnUruchomDeploy.disabled = true;
      btnDeployAnuluj.disabled = true;
      btnDeployZamknijX.disabled = true;

      deployStatusIkona.classList.add('d-none');
      deploySpinner.classList.remove('d-none');
      deployStatusTytul.textContent = 'Trwa publikacja na Cloudflare...';
      deployStatusOpis.textContent = 'Budowanie projektu Astro i wysyłanie plików przez Wrangler... Może to potrwać kilkadziesiąt sekund.';
      deployLogBox.textContent = 'Rozpoczynanie procesu deploymentu (npm run deploy)...\n';

      try {
        const wynik = await api.runDeploy();
        deploySpinner.classList.add('d-none');
        deployStatusIkona.classList.remove('d-none');

        if (wynik.sukces) {
          deployStatusIkona.className = 'fa-solid fa-circle-check fa-2x text-success';
          deployStatusTytul.innerHTML = `<span class="text-success">Publikacja zakończona sukcesem!</span>`;
          deployStatusOpis.textContent = `Wdrożono pomyślnie w ${wynik.czasTrwaniaSekund}s. Zmiany są już widoczne na Cloudflare!`;
          toast.pokaz('Strona została pomyślnie opublikowana na Cloudflare!', 'success');
        } else {
          deployStatusIkona.className = 'fa-solid fa-circle-xmark fa-2x text-danger';
          deployStatusTytul.innerHTML = `<span class="text-danger">Wystąpił błąd podczas publikacji</span>`;
          deployStatusOpis.textContent = `Kod wyjścia: ${wynik.kodWyjscia}. Sprawdź szczegóły w poniższym logu.`;
          toast.pokaz('Błąd wdrożenia Cloudflare. Sprawdź logi.', 'danger');
        }

        deployLogBox.textContent = wynik.logi || 'Brak danych wyjściowych.';
        deployLogBox.scrollTop = deployLogBox.scrollHeight;
      } catch (err) {
        deploySpinner.classList.add('d-none');
        deployStatusIkona.classList.remove('d-none');
        deployStatusIkona.className = 'fa-solid fa-circle-xmark fa-2x text-danger';
        deployStatusTytul.innerHTML = `<span class="text-danger">Błąd sieci</span>`;
        deployStatusOpis.textContent = err.message;
        deployLogBox.textContent = `Błąd połączenia z serwerem panelu: ${err.message}`;
      } finally {
        btnUruchomDeploy.disabled = false;
        btnDeployAnuluj.disabled = false;
        btnDeployZamknijX.disabled = false;
      }
    });
  };

  /**
   * Główna funkcja startowa aplikacji.
   */
  const init = async () => {
    bindEvents();
    await wczytajDane();
  };

  return Object.freeze({
    init
  });
};

// Start aplikacji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  const apiClient = createApiClient();
  const toastManager = createToastManager();
  const app = createAppController(apiClient, toastManager);
  app.init();
});

