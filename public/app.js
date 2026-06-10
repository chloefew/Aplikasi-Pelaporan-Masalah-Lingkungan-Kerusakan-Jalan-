document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('report-form');
  const btnGeo = document.getElementById('btn-get-location');
  const locationMessage = document.getElementById('location-message');
  const latitudeInput = document.getElementById('latitude');
  const longitudeInput = document.getElementById('longitude');
  const status = document.getElementById('status');
  const reportsList = document.getElementById('reports-list');

  const loadReports = async () => {
    reportsList.innerHTML = 'Memuat laporan...';
    try {
      const response = await fetch('/api/reports');
      const reports = await response.json();
      renderReports(reports);
    } catch (error) {
      reportsList.innerHTML = '<p>Gagal memuat laporan.</p>';
    }
  };

  // Map & groups
  let map, markersLayer;

  const initMap = () => {
    map = L.map('map').setView([-6.200000, 106.816666], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersLayer = L.markerClusterGroup();
    map.addLayer(markersLayer);
  };

  const loadGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const groups = await res.json();
      renderGroups(groups);
    } catch (err) {
      console.error('Gagal memuat groups', err);
    }
  };

  const renderGroups = (groups) => {
    markersLayer.clearLayers();
    groups.forEach(g => {
      const el = L.marker([g.latitude, g.longitude], {
        title: `${g.category} • ${g.count} laporan`
      });

      const popupHtml = `
        <div style="min-width:200px">
          <strong>${g.category}</strong><br/>
          ${g.count} laporan • terakhir: ${new Date(g.lastReportAt).toLocaleString('id-ID')}<br/>
          <button data-id="${g.id}" class="btn-confirm">Saya juga melaporkan</button>
        </div>
      `;

      el.bindPopup(popupHtml);
      markersLayer.addLayer(el);
    });
  };

  // Delegate click for confirm buttons inside popups
  document.addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('btn-confirm')) {
      const id = e.target.getAttribute('data-id');
      try {
        const res = await fetch(`/api/groups/${id}/confirm`, { method: 'POST' });
        if (!res.ok) throw new Error('Gagal konfirmasi');
        await loadGroups();
        await loadReports();
        alert('Terima kasih, konfirmasi Anda tercatat.');
      } catch (err) {
        alert('Gagal mengirim konfirmasi.');
      }
    }
  });

  const renderReports = (reports) => {
    if (!Array.isArray(reports) || reports.length === 0) {
      reportsList.innerHTML = '<p>Belum ada laporan.</p>';
      return;
    }

    reportsList.innerHTML = reports.map((report) => {
      return `
        <article class="report-item">
          <img src="${report.photo}" alt="Foto kerusakan jalan" />
          <div class="report-content">
            <h3>${report.place || 'Lokasi tidak ditentukan'}</h3>
            <p>${report.description || 'Tidak ada deskripsi tambahan.'}</p>
            <p class="report-meta">Koordinat: ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}</p>
            <p class="report-meta">Dilaporkan: ${new Date(report.createdAt).toLocaleString('id-ID')}</p>
          </div>
        </article>
      `;
    }).join('');
  };

  btnGeo.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationMessage.textContent = 'Geolokasi tidak didukung oleh browser Anda.';
      return;
    }

    locationMessage.textContent = 'Mendapatkan lokasi...';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        latitudeInput.value = latitude;
        longitudeInput.value = longitude;
        locationMessage.textContent = `Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      },
      (error) => {
        locationMessage.textContent = `Gagal mengambil lokasi: ${error.message}`;
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    if (!formData.get('photo') || !formData.get('photo').name) {
      status.textContent = 'Silakan unggah foto bukti kerusakan jalan.';
      return;
    }

    if (!formData.get('latitude') || !formData.get('longitude')) {
      status.textContent = 'Silakan dapatkan lokasi GPS terlebih dahulu.';
      return;
    }

    status.textContent = 'Mengirim laporan...';

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat mengirim laporan.');
      }

      status.textContent = 'Laporan berhasil dikirim. Terima kasih!';
      form.reset();
      locationMessage.textContent = 'Tekan untuk mengambil koordinat GPS.';
      latitudeInput.value = '';
      longitudeInput.value = '';
      loadReports();
      loadGroups();
    } catch (error) {
      status.textContent = error.message;
    }
  });

  initMap();
  loadReports();
  loadGroups();
});
