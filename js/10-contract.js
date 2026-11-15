let activeContractDocData = null;

function getCreditTextByRole(role, directorName) {
  const cleanName = String(directorName || 'Fikri Yassaar Arrazaq').split(',')[0].trim();
  if (role === 'Composer') return `Musik: ${cleanName}`;
  if (role === 'Arranger') return `Aransemen: ${cleanName}`;
  if (role === 'Tim produksi saja') return `Produksi musik: PrangArt Lab`;
  return `Musik dan aransemen: ${cleanName}`;
}

function buildContractDataFromProject(proj) {
  const dpNominal = proj.dpAmount || Math.round((proj.totalPrice || 0) * 0.5);
  const pelunasanNominal = (proj.totalPrice || 0) - dpNominal;
  const role = proj.composerRole || 'Composer & Arranger';
  return {
    nomorPerjanjian: proj.contractNumber || `${proj.id.replace('PAL-2026-', '')}/PAL-SPK/XI/2026`,
    tanggal: proj.createdAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    pihak1Nama: appState.settings.directorName,
    pihak1Alamat: appState.settings.studioAddress,
    pihak1Nik: appState.settings.directorIdNumber || '6472050000000001',
    nama: proj.clientName || '........................................',
    sanggar: proj.instansi || '........................................',
    alamatKlien: proj.alamat || proj.kota || '........................................',
    nikKlien: proj.nik || '........................................',
    namaTari: proj.judul || '........................................',
    jenisKarya: proj.jenisTari || proj.serviceLineLabel || 'Karya Tari / Musik',
    judulBerkas: proj.musicFileTitle || `${(proj.judul || 'Karya').replace(/\s+/g, '_')}_Final`,
    estimasi: proj.durasi || '.... : ....',
    formatFile: proj.deliverableFormat || 'WAV / MP3',
    jumlahFormatted: Number(proj.totalPrice || 0).toLocaleString('id-ID') + ',00',
    jumlahTerbilang: `${numberToIndonesianWords(proj.totalPrice || 0)} Rupiah`,
    dpFormatted: formatRupiah(dpNominal),
    pelunasanFormatted: formatRupiah(pelunasanNominal),
    revisiJumlah: proj.revisionQuota || '6',
    kedudukan: role,
    formatKredit: getCreditTextByRole(role, appState.settings.directorName),
    materiPihakKetiga: proj.thirdPartyMaterial || 'Tidak ada',
    kolaborator: proj.collaboratorNotes || 'Tidak ada kontributor tambahan',
    berkasMentah: proj.rawFilesIncluded ? `Diserahkan: ${proj.rawFilesDetail}` : 'Tidak diserahkan',
    catatanTambahan: proj.extraAttachmentNotes || proj.quoteNotes || '-',
    kotaPengadilan: proj.courtCity || 'Samarinda',
    serviceLine: proj.serviceLine || 'tari',
    serviceLineLabel: proj.serviceLineLabel || 'Produksi Musik Tari',
    ticketId: proj.id || 'DRAFT'
  };
}

function openDraftContractPreviewModal() {
  const u = appState.currentClientUser || {};
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const addonChecked = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const total = pkg.price + (addonChecked ? svc.addonPrice : 0);
  const defaultRev = appState.selectedPackage === 'dasar' ? '3' : appState.selectedPackage === 'standar' ? '6' : 'Sesuai kesepakatan';

  const draftProj = {
    id: 'DRAFT',
    createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    clientName: document.getElementById('field-nama')?.value.trim() || u.name || '........................................',
    instansi: document.getElementById('field-instansi')?.value.trim() || u.instansi || '........................................',
    alamat: document.getElementById('field-alamat')?.value.trim() || u.alamat || '........................................',
    nik: document.getElementById('field-nik')?.value.trim() || u.nik || '........................................',
    judul: document.getElementById('field-judul')?.value.trim() || '........................................',
    jenisTari: document.getElementById('field-jenis-tari')?.value.trim() || svc.label,
    durasi: document.getElementById('field-durasi')?.value.trim() || '05:00',
    totalPrice: total,
    dpAmount: Math.round(total * 0.5),
    revisionQuota: defaultRev,
    serviceLine: appState.selectedServiceLine,
    serviceLineLabel: svc.label
  };
  activeContractDocData = buildContractDataFromProject(draftProj);
  renderContractDocumentCanvas();
  document.getElementById('contract-sign-footer')?.classList.add('hidden');
  const modal = document.getElementById('contract-doc-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function openContractDocModal(projId, enableSigning = false) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  activeContractDocData = buildContractDataFromProject(proj);
  renderContractDocumentCanvas();
  const footer = document.getElementById('contract-sign-footer');
  const cb = document.getElementById('sign-agreement-cb');
  const addrInp = document.getElementById('sign-client-address');
  const nikInp = document.getElementById('sign-client-nik');
  if (cb) cb.checked = false;
  if (addrInp) addrInp.value = proj.alamat || proj.kota || '';
  if (nikInp) nikInp.value = proj.nik || '';
  if (footer) {
    if (enableSigning && !proj.agreementSigned) {
      footer.classList.remove('hidden');
      footer.classList.add('flex');
    } else {
      footer.classList.add('hidden');
      footer.classList.remove('flex');
    }
  }
  const modal = document.getElementById('contract-doc-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeContractDocModal() {
  const modal = document.getElementById('contract-doc-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

async function confirmClientAdministrativeApproval() {
  const cb = document.getElementById('sign-agreement-cb');
  if (!cb?.checked) {
    showToast('Centang Persetujuan', 'Centang kotak persetujuan perjanjian terlebih dahulu.', 'warning');
    return;
  }
  const proj = appState.projects.find(p => p.id === activeContractDocData?.ticketId);
  if (!proj) return;
  const addrVal = document.getElementById('sign-client-address')?.value.trim();
  const nikVal = document.getElementById('sign-client-nik')?.value.trim();
  if (addrVal) proj.alamat = addrVal;
  if (nikVal) proj.nik = nikVal;

  proj.agreementSigned = true;
  proj.agreementSignedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  proj.productionStatus = TRACKER_MILESTONES[3];
  await syncProjectToCloud(proj);
  closeContractDocModal();
  renderClientWorkspace();
  showToast('Perjanjian Disetujui', 'Tahap pembayaran telah dibuka untuk pesanan Anda.');
}

function renderContractDocumentCanvas() {
  const d = activeContractDocData;
  const canvasEl = document.getElementById('contract-doc-canvas');
  const headingEl = document.getElementById('contract-modal-heading');
  if (!d || !canvasEl) return;

  const isTranskripsi = d.serviceLine === 'transkripsi';
  const docMainTitle = isTranskripsi
    ? 'PERSETUJUAN PENAWARAN & KETENTUAN TRANSKRIPSI MUSIK'
    : 'PERJANJIAN PRODUKSI MUSIK';

  if (headingEl) headingEl.textContent = `${docMainTitle} — PrangArt Lab`;

  const checkMark = (target) => (d.kedudukan === target ? '[ ✓ ]' : '[   ]');
  const isNoCollab = d.kolaborator.toLowerCase().includes('tidak ada');

  canvasEl.innerHTML = `
    <div class="space-y-5 text-neutral-900 text-xs sm:text-[13px] leading-relaxed">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
        <div class="flex items-center gap-3">
          <img src="${LOGO_URL}" alt="PrangArt Lab" class="w-14 h-14 object-contain" />
          <div>
            <p class="text-xs font-bold tracking-widest uppercase">PRANGART LAB</p>
            <h2 class="text-lg sm:text-xl font-bold uppercase">${docMainTitle}</h2>
            <p class="text-xs">Nomor: <strong>${d.nomorPerjanjian}</strong> &nbsp;|&nbsp; Tanggal: <strong>${d.tanggal}</strong></p>
          </div>
        </div>
      </div>

      <table class="w-full border-collapse border border-neutral-900 text-xs">
        <tbody>
          <tr class="border-b border-neutral-900">
            <td class="border-r border-neutral-900 p-3 font-bold w-40 align-top bg-neutral-100">PIHAK PERTAMA</td>
            <td class="p-3 space-y-0.5">
              <p>Nama: <strong>${d.pihak1Nama}</strong></p>
              <p>Kedudukan dalam karya ini: sebagaimana Lampiran A (<em>${d.kedudukan}</em>)</p>
              <p>Pemilik usaha <strong>PrangArt Lab</strong></p>
              <p>Alamat: ${d.pihak1Alamat}</p>
              <p>Nomor Identitas: ${d.pihak1Nik}</p>
            </td>
          </tr>
          <tr>
            <td class="border-r border-neutral-900 p-3 font-bold align-top bg-neutral-100">PIHAK KEDUA</td>
            <td class="p-3 space-y-0.5">
              <p>Nama: <strong>${d.nama}</strong></p>
              <p>Instansi/Sanggar/Komunitas/Individu: <strong>${d.sanggar}</strong></p>
              <p>Alamat: ${d.alamatKlien}</p>
              <p>Nomor Identitas: ${d.nikKlien}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <p>Para Pihak sepakat mengikatkan diri dengan ketentuan berikut.</p>

      <div class="space-y-1.5">
        <h3 class="font-bold uppercase text-sm">RINGKASAN KESEPAKATAN</h3>
        <p class="text-[11px] italic text-neutral-600">Ringkasan ini memudahkan membaca isi perjanjian. Jika ada perbedaan dengan pasal-pasal, pasal yang berlaku.</p>
        <table class="w-full border-collapse border border-neutral-900 text-xs">
          <tbody>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold w-52 bg-neutral-50">Karya</td><td class="p-2"><strong>${d.namaTari}</strong> (${d.jenisKarya}), judul berkas <strong>${d.judulBerkas}</strong></td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Yang dikerjakan</td><td class="p-2">Sesuai kedudukan PIHAK PERTAMA di Lampiran A (${d.kedudukan}): komposisi, aransemen, produksi audio, mixing, dan/atau mastering</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">File yang diterima</td><td class="p-2">${d.formatFile}, durasi estimasi <strong>${d.estimasi}</strong> menit</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Harga</td><td class="p-2"><strong>Rp${d.jumlahFormatted}</strong> (<em>${d.jumlahTerbilang}</em>), sudah termasuk pengalihan hak ekonomi</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Pembayaran</td><td class="p-2">50% (${d.dpFormatted}) sebelum produksi dimulai, 50% (${d.pelunasanFormatted}) setelah draf final disetujui dan sebelum file final diserahkan</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Revisi</td><td class="p-2"><strong>${d.revisiJumlah}</strong> kali revisi ringan</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Hak yang diterima PIHAK KEDUA</td><td class="p-2">Seluruh hak ekonomi atas musik ini, dialihkan otomatis setelah pelunasan dan penyerahan file final</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Persetujuan pengalihan</td><td class="p-2">Dengan menandatangani perjanjian ini, PIHAK KEDUA menyetujui pengalihan otomatis tersebut, tanpa tanda tangan tambahan</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Pencatatan HKI</td><td class="p-2">PrangArt Lab dapat mencatatkan karya sesuai kedudukan Pencipta di Lampiran A. Klien dapat dicatat sebagai pemegang hak ekonomi setelah pengalihan berlaku</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Kredit</td><td class="p-2"><strong>"${d.formatKredit}"</strong> (lihat Pasal 4 ayat 1)</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Portofolio</td><td class="p-2">PrangArt Lab tetap berhak menampilkan karya ini sebagai portofolio</td></tr>
            <tr><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Tidak termasuk</td><td class="p-2">File mentah, multitrack, sesi DAW, dan preset, kecuali tercantum di Lampiran A</td></tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3.5 pt-2">
        <div>
          <h4 class="font-bold uppercase">PASAL 1 — OBJEK DAN PENYERAHAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>PIHAK PERTAMA melaksanakan pekerjaan sesuai kedudukannya di Lampiran A, berupa komposisi, aransemen, produksi audio, mixing, dan/atau mastering untuk karya yang diuraikan di Lampiran A, sesuai konsep yang disepakati secara tertulis sebelum produksi dimulai.</li>
            <li>PIHAK PERTAMA menyerahkan berkas final sesuai Lampiran A. Berkas proyek mentah, multitrack, sesi DAW, dan preset tidak diserahkan kecuali dicantumkan secara tegas di Lampiran A.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 2 — HARGA DAN PEMBAYARAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Harga keseluruhan adalah <strong>Rp${d.jumlahFormatted}</strong> (<em>${d.jumlahTerbilang}</em>). Harga ini sudah termasuk pekerjaan produksi dan pengalihan hak ekonomi sesuai Pasal 3.</li>
            <li>Pembayaran dilakukan dalam dua termin: (a) 50% sebelum produksi dimulai; dan (b) 50% setelah draf final disetujui dan sebelum file final diserahkan.</li>
            <li>Apabila PIHAK KEDUA membatalkan setelah produksi dimulai, pembayaran atas pekerjaan dan biaya yang telah dikeluarkan tetap berlaku secara proporsional sesuai progres.</li>
            <li>Perubahan konsep atau pekerjaan di luar kesepakatan awal dikenakan biaya tambahan setelah disetujui secara tertulis oleh Para Pihak.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 3 — PENGALIHAN HAK EKONOMI</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Dengan menandatangani perjanjian ini, PIHAK KEDUA menyetujui pengalihan hak ekonomi sebagaimana diatur dalam pasal ini. Persetujuan ini merupakan perjanjian tertulis mengenai pengalihan hak, dan tidak diperlukan konfirmasi atau tanda tangan tambahan pada saat pelunasan.</li>
            <li>Setelah pembayaran lunas diterima PIHAK PERTAMA dan file final diserahkan, hak ekonomi PIHAK PERTAMA atas komposisi/aransemen musik, sepanjang dimiliki sesuai kedudukannya, dialihkan secara otomatis kepada PIHAK KEDUA. Sepanjang PIHAK PERTAMA merupakan pemegang hak yang sah, hak ekonomi atas rekaman master final yang dibuat untuk pesanan ini juga dialihkan kepada PIHAK KEDUA dengan cara yang sama.</li>
            <li>Hak ekonomi yang dialihkan meliputi penggandaan, penerbitan, pengadaptasian, pengaransemenan, pendistribusian, pertunjukan, pengumuman, komunikasi kepada publik, dan penyewaan. PIHAK KEDUA berwenang memanfaatkannya untuk kepentingan pribadi, kelembagaan, maupun komersial, termasuk memberikan izin atau lisensi kepada pihak lain, tanpa persetujuan tambahan dari PIHAK PERTAMA.</li>
            <li>Selama hak tersebut berada pada PIHAK KEDUA, PIHAK PERTAMA tidak memberikan lisensi atau mengeksploitasi secara komersial hak yang sama, kecuali dengan persetujuan tertulis PIHAK KEDUA.</li>
            <li>Para Pihak memahami bahwa Pasal 18 Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta mengatur bahwa untuk pengalihan lagu dan/atau musik tanpa batas waktu, Hak Cipta beralih kembali kepada Pencipta setelah 25 (dua puluh lima) tahun. Ketentuan pengalihan ini tidak dimaksudkan mengesampingkan ketentuan wajib tersebut.</li>
            <li>Pengalihan hak ekonomi tidak mencakup hak moral Pencipta, materi pihak ketiga yang tidak dikuasai sah oleh PIHAK PERTAMA, maupun hak kolaborator yang diatur dalam Pasal 5.</li>
            <li>Dengan menandatangani perjanjian ini, PIHAK KEDUA menyetujui bahwa PIHAK PERTAMA dapat mencatatkan karya ini ke Direktorat Jenderal Kekayaan Intelektual atas nama PIHAK PERTAMA, sesuai kedudukannya sebagai Pencipta untuk bagian yang benar-benar diciptakannya, tanpa konfirmasi tambahan dari PIHAK KEDUA. Setelah pengalihan berlaku sesuai ayat (2), PIHAK KEDUA dapat mencatatkan perubahan pemegang hak ekonomi dengan dokumen perjanjian ini, dan PIHAK PERTAMA bersedia memberikan dokumen yang secara wajar diperlukan. Apabila terdapat kolaborator sebagai Pencipta bersama, pencatatan mengikuti Lampiran B. Biaya pencatatan ditanggung pihak yang mengajukan.</li>
            <li>Apabila PIHAK PERTAMA hanya berkedudukan sebagai tim produksi, yang dialihkan adalah hak atas rekaman master dan hak lain yang dimiliki PIHAK PERTAMA. Hak ekonomi atas komposisi hanya dialihkan jika pencipta komposisi telah mengalihkannya kepada PIHAK PERTAMA, yang dibuktikan dengan Lampiran C.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 4 — KREDIT DAN HAK MORAL</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Format kredit mengikuti kedudukan PIHAK PERTAMA di Lampiran A: (a) Composer: "Musik: Fikri Yassaar Arrazaq"; (b) Arranger: "Aransemen: Fikri Yassaar Arrazaq"; (c) Composer &amp; Arranger: "Musik dan aransemen: Fikri Yassaar Arrazaq"; atau (d) tim produksi: "Produksi musik: PrangArt Lab". Nama tanpa gelar. Nama PrangArt Lab merupakan identitas studio, bukan pengganti nama Pencipta.</li>
            <li>PIHAK KEDUA mengupayakan pencantuman kredit tersebut secara wajar dan konsisten, dengan tetap memperhatikan hak moral Pencipta sesuai peraturan perundang-undangan.</li>
            <li>PIHAK KEDUA tidak boleh dicantumkan sebagai Pencipta karya ini, dan tidak boleh menyatakan dirinya atau pihak lain sebagai Pencipta. PIHAK KEDUA dapat dicantumkan sebagai pemesan, atau sebagai pemegang hak ekonomi, dan pencantuman sebagai pemegang hak ekonomi hanya berlaku setelah pengalihan berlaku sesuai Pasal 3 ayat (2).</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 5 — KOLABORASI</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Apabila dalam produksi terdapat kolaborator (musisi, penyanyi, arranger tambahan, atau pihak lain yang memberikan kontribusi kreatif), kolaborator tersebut dicatat di Lampiran B dan kontribusinya diatur dalam Lampiran C.</li>
            <li>Hak ekonomi atas kontribusi kolaborator hanya dialihkan sejauh PIHAK PERTAMA memiliki kewenangan tertulis untuk itu. Jika belum ada, bagian tersebut diganti, ditunda, atau diberikan lisensi terbatas yang dinyatakan secara tegas sebelum penyerahan final.</li>
            <li>Pemanfaatan hak ekonomi oleh PIHAK KEDUA dapat dilakukan bersama kolaborator sebagaimana dicatat di Lampiran B.</li>
            <li>Apabila tidak ada kolaborator, Lampiran B diisi "Tidak ada kontributor tambahan".</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 6 — MATERI PIHAK KETIGA</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Sample, loop, sample library, plugin, atau instrumen virtual hanya digunakan sesuai lisensinya. Pembelian atau akses suatu library tidak otomatis mengalihkan hak cipta atas sampel atau instrumen tersebut.</li>
            <li>PIHAK PERTAMA memberitahukan secara tertulis kepada PIHAK KEDUA apabila terdapat materi berlisensi dengan batasan, seperti larangan distribusi sebagai file tersendiri atau kewajiban atribusi. Batasan tersebut tetap berlaku dan tidak termasuk dalam pengalihan.</li>
            <li>Materi yang disediakan sendiri oleh PIHAK KEDUA menjadi tanggung jawab PIHAK KEDUA untuk memastikan izinnya.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 7 — PORTOFOLIO</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>PIHAK PERTAMA berhak mengunggah dan menampilkan karya ini sebagai portofolio dan promosi PrangArt Lab, berupa cuplikan musik, nama karya, dan materi terkait. Hak ini merupakan hak PIHAK PERTAMA dan tidak termasuk dalam pengalihan hak ekonomi.</li>
            <li>Penggunaan portofolio tetap memperhatikan hak pihak ketiga, informasi rahasia, dan data pribadi.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 8 — REVISI DAN PERNYATAAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>PIHAK KEDUA berhak atas <strong>${d.revisiJumlah}</strong> kali revisi ringan selama tetap dalam konsep dan spesifikasi yang disepakati. Perubahan konsep dasar atau penambahan di luar kesepakatan dikenakan biaya tambahan dan wajib disetujui tertulis oleh PIHAK KEDUA sebelum dikerjakan.</li>
            <li>PIHAK PERTAMA menyatakan bahwa sepanjang pengetahuannya, bagian yang dibuatnya sendiri merupakan hasil kreativitasnya dan tidak dengan sengaja melanggar hak pihak lain.</li>
            <li>PIHAK KEDUA bertanggung jawab atas legalitas materi, referensi, lirik, atau rekaman yang disediakannya untuk dimasukkan ke dalam musik.</li>
            <li>Apabila timbul klaim pihak ketiga, pihak yang mengetahuinya wajib memberitahukan secara tertulis, dan Para Pihak bekerja sama menyelesaikannya sesuai sumber klaim dan hukum yang berlaku.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 9 — PENYELESAIAN PERSELISIHAN DAN PENUTUP</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Perselisihan diselesaikan terlebih dahulu melalui musyawarah. Jika tidak tercapai kesepakatan, Para Pihak dapat menempuh jalur hukum dengan domisili pada Pengadilan Negeri <strong>${d.kotaPengadilan}</strong>.</li>
            <li>Perjanjian berlaku sejak ditandatangani. Pengalihan hak ekonomi efektif setelah syarat Pasal 3 ayat (2) terpenuhi.</li>
            <li>Setiap perubahan hanya berlaku jika dibuat secara tertulis dan disetujui Para Pihak. Lampiran A, B, dan C merupakan bagian yang tidak terpisahkan dari perjanjian ini.</li>
            <li>Ketentuan yang bertentangan dengan hukum yang bersifat wajib tidak berlaku, dan ketentuan lainnya tetap berlaku sepanjang dapat dipisahkan.</li>
            <li>Perjanjian dibuat dalam 2 (dua) rangkap yang masing-masing mempunyai kekuatan hukum yang sama.</li>
          </ol>
        </div>
      </div>

      <div class="pt-4">
        <p>Dibuat dan ditandatangani di: <strong>${d.kotaPengadilan}</strong> &nbsp;|&nbsp; Pada tanggal: <strong>${d.tanggal}</strong></p>
        <table class="w-full border-collapse border border-neutral-900 text-center mt-2 text-xs">
          <thead>
            <tr class="border-b border-neutral-900 bg-neutral-100">
              <th class="border-r border-neutral-900 p-2 w-1/2">PIHAK PERTAMA</th>
              <th class="p-2 w-1/2">PIHAK KEDUA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border-r border-neutral-900 p-3 pt-16">
                <p class="font-bold underline">${d.pihak1Nama}</p>
                <p>PrangArt Lab</p>
              </td>
              <td class="p-3 pt-16">
                <p class="font-bold underline">${d.nama}</p>
                <p>${d.sanggar}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t-2 border-neutral-900 pt-5 space-y-2">
        <h3 class="font-bold uppercase text-sm">LAMPIRAN A — IDENTITAS KARYA DAN RINCIAN PENYERAHAN</h3>
        <table class="w-full border-collapse border border-neutral-900 text-xs">
          <tbody>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold w-52 bg-neutral-50">Judul karya</td><td class="p-2 font-bold">${d.namaTari}</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Jenis karya</td><td class="p-2">${d.jenisKarya}</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Kedudukan PIHAK PERTAMA</td><td class="p-2 font-mono text-[11px]">${checkMark('Composer')} Composer &nbsp; ${checkMark('Arranger')} Arranger &nbsp; ${checkMark('Composer & Arranger')} Composer &amp; Arranger &nbsp; ${checkMark('Tim produksi saja')} Tim produksi saja</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Judul berkas musik</td><td class="p-2 font-mono">${d.judulBerkas}</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Tanggal penyelesaian</td><td class="p-2">${d.tanggal} (sesuai jadwal penawaran)</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Durasi</td><td class="p-2">${d.estimasi} menit</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Format file yang diserahkan</td><td class="p-2">${d.formatFile}</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Materi pihak ketiga</td><td class="p-2">${d.materiPihakKetiga}</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Kolaborator</td><td class="p-2">${d.kolaborator}</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Berkas mentah/multitrack</td><td class="p-2">${d.berkasMentah}</td></tr>
            <tr><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Catatan tambahan</td><td class="p-2">${d.catatanTambahan}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="pt-3 space-y-2">
        <h3 class="font-bold uppercase text-sm">LAMPIRAN B — DAFTAR KOLABORATOR</h3>
        <p class="text-[11px] italic text-neutral-600">${isNoCollab ? 'Tidak ada kontributor tambahan.' : d.kolaborator}</p>
        <table class="w-full border-collapse border border-neutral-900 text-xs">
          <thead>
            <tr class="border-b border-neutral-900 bg-neutral-100">
              <th class="border-r border-neutral-900 p-1.5 w-10">No.</th>
              <th class="border-r border-neutral-900 p-1.5">Nama &amp; identitas</th>
              <th class="border-r border-neutral-900 p-1.5">Peran/kredit</th>
              <th class="border-r border-neutral-900 p-1.5">Uraian kontribusi</th>
              <th class="p-1.5">Status dokumen</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-neutral-900">
              <td class="border-r border-neutral-900 p-1.5 text-center">1</td>
              <td class="border-r border-neutral-900 p-1.5">${isNoCollab ? 'Tidak ada kontributor tambahan' : d.kolaborator}</td>
              <td class="border-r border-neutral-900 p-1.5">-</td>
              <td class="border-r border-neutral-900 p-1.5">-</td>
              <td class="p-1.5">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pt-3 space-y-2 border-t border-dashed border-neutral-400">
        <h3 class="font-bold uppercase text-sm">LAMPIRAN C — FORMULIR KOLABORATOR</h3>
        <p class="text-[11px] text-neutral-700">Formulir ini dibuat untuk setiap kolaborator dan ditandatangani sebelum kontribusinya digunakan.</p>
        <div class="border border-neutral-900 p-3 space-y-1.5 text-xs">
          <p><strong>PENGELOLA PROYEK:</strong> ${d.pihak1Nama}, penyedia jasa dengan identitas usaha <strong>PrangArt Lab</strong>.</p>
          <p><strong>KOLABORATOR:</strong> ........................................, alamat ........................................, nomor identitas ........................................</p>
          <p><strong>Peran/kredit:</strong> [ ] Composer &nbsp; [ ] Arranger &nbsp; [ ] Composer &amp; Arranger &nbsp; [ ] Additional Composer &nbsp; [ ] Additional Arranger &nbsp; [ ] Collaborator</p>
          <p>1. KOLABORATOR menyatakan bahwa kontribusinya merupakan hasil pekerjaannya sendiri atau telah memperoleh izin yang diperlukan.</p>
          <p>2. Sepanjang hak ekonominya dapat dialihkan menurut hukum, KOLABORATOR mengalihkan kepada PENGELOLA PROYEK hak ekonomi atas kontribusi tersebut, untuk selanjutnya dialihkan kepada PIHAK KEDUA sesuai Pasal 3 perjanjian produksi ini.</p>
          <p>3. Pengalihan tidak mencakup hak moral KOLABORATOR sebagai Pencipta, hak pihak ketiga, maupun materi yang tidak dikuasai sah olehnya.</p>
        </div>
      </div>
    </div>
  `;
}

function downloadContractDocPNG() {
  const d = activeContractDocData;
  if (!d) return;
  const c = document.createElement('canvas');
  c.width = 1240;
  c.height = 1754;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#171717';

  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRANGART LAB', 620, 65);
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('PERJANJIAN PRODUKSI MUSIK', 620, 98);
  ctx.font = '17px Georgia, serif';
  ctx.fillText(`Nomor: ${d.nomorPerjanjian}   |   Tanggal: ${d.tanggal}`, 620, 126);

  ctx.beginPath(); ctx.moveTo(80, 144); ctx.lineTo(1160, 144); ctx.stroke();

  ctx.textAlign = 'left';
  let y = 176;
  const lh = 23;

  const writeLine = (txt, bold = false) => {
    ctx.font = `${bold ? 'bold ' : ''}16px Georgia, serif`;
    wrapCanvasText(ctx, txt, 1080).forEach(line => {
      ctx.fillText(line, 80, y);
      y += lh;
    });
  };

  writeLine(`PIHAK PERTAMA: ${d.pihak1Nama} (Pemilik usaha PrangArt Lab • Kedudukan: ${d.kedudukan})`, true);
  writeLine(`Alamat: ${d.pihak1Alamat} | No. Identitas: ${d.pihak1Nik}`);
  writeLine(`PIHAK KEDUA: ${d.nama} — ${d.sanggar}`, true);
  writeLine(`Alamat: ${d.alamatKlien} | No. Identitas: ${d.nikKlien}`);
  y += 6;
  writeLine(`RINGKASAN & PASAL 1 (Objek): Karya "${d.namaTari}" (${d.jenisKarya}), berkas ${d.judulBerkas}, durasi ${d.estimasi} menit, format ${d.formatFile}. Berkas mentah/multitrack: ${d.berkasMentah}.`);
  y += 5;
  writeLine(`PASAL 2 (Harga & Pembayaran): Rp${d.jumlahFormatted} (${d.jumlahTerbilang}), sudah termasuk pengalihan hak ekonomi. Termin I: 50% (${d.dpFormatted}), Termin II: 50% (${d.pelunasanFormatted}).`);
  y += 5;
  writeLine(`PASAL 3 (Pengalihan Hak Ekonomi): Setelah pembayaran lunas diterima PIHAK PERTAMA dan file final diserahkan, seluruh hak ekonomi dialihkan otomatis kepada PIHAK KEDUA tanpa tanda tangan tambahan (tunduk pada Pasal 18 UU No. 28 Tahun 2014 tentang Hak Cipta).`);
  y += 5;
  writeLine(`PASAL 4 (Kredit & Hak Moral): Format kredit wajib dicantumkan: "${d.formatKredit}" (nama tanpa gelar).`);
  y += 5;
  writeLine(`PASAL 5, 6, 7 (Kolaborasi, Materi Pihak Ketiga & Portofolio): Kolaborator: ${d.kolaborator}. Materi pihak ketiga: ${d.materiPihakKetiga}. PrangArt Lab berhak menampilkan cuplikan karya sebagai portofolio.`);
  y += 5;
  writeLine(`PASAL 8 & 9 (Revisi & Penutup): ${d.revisiJumlah} kali revisi ringan sesuai konsep awal. Domisili penyelesaian perselisihan: Pengadilan Negeri ${d.kotaPengadilan}. Lampiran A, B, dan C merupakan bagian tidak terpisahkan.`);

  const sigY = Math.max(y + 50, 1480);
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('PIHAK PERTAMA', 320, sigY);
  ctx.fillText(d.pihak1Nama, 320, sigY + 125);
  ctx.fillText('PrangArt Lab', 320, sigY + 150);

  ctx.fillText('PIHAK KEDUA', 920, sigY);
  ctx.fillText(d.nama, 920, sigY + 125);
  ctx.fillText(d.sanggar, 920, sigY + 150);

  triggerPngFileDownload(c.toDataURL('image/png'), `Perjanjian-PrangArtLab-${d.ticketId}.png`);
  showToast('Dokumen Diunduh', 'Perjanjian Produksi Musik PrangArt Lab siap dikirim.');
}