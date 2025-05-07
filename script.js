function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

document.getElementById('form-waris').addEventListener('submit', function(e) {
  e.preventDefault();

  const totalHarta = parseInt(document.getElementById('harta').value.replace(/\./g, '')) || 0;
  let suami = +document.getElementById('suami').value || 0;
  let istri = +document.getElementById('istri').value || 0;
  let ayah = +document.getElementById('ayah').value || 0;
  let ibu = +document.getElementById('ibu').value || 0;
  let anakL = +document.getElementById('anakL').value || 0;
  let anakP = +document.getElementById('anakP').value || 0;
  let cucuL = +document.getElementById('cucuL').value || 0;
  let cucuP = +document.getElementById('cucuP').value || 0;
  let saudaraL = +document.getElementById('saudaraL').value || 0;
  let saudaraP = +document.getElementById('saudaraP').value || 0;

  const catatan = [];

  // Gugurkan cucu jika ada anak kandung
  if (anakL > 0 || anakP > 0) {
    cucuL = 0;
    cucuP = 0;
    catatan.push("Cucu tidak mendapat warisan karena ada anak kandung.");
  }

  // Gugurkan saudara jika ada ayah dan anak
  if ((anakL + anakP > 0) && ayah > 0) {
    saudaraL = 0;
    saudaraP = 0;
    catatan.push("Saudara kandung tidak mendapat warisan karena ada ayah dan anak.");
  }

  // Hitung bagian tetap
  let bagianSuami = suami > 0 ? totalHarta * (anakL + anakP > 0 ? 0.25 : 0.5) : 0;
  let bagianIstri = istri > 0 ? totalHarta * (anakL + anakP > 0 ? 0.125 : 0.25) : 0;
  let bagianIbu = 0;
  if (ibu > 0) {
    if ((anakL + anakP > 0) || (saudaraL + saudaraP) >= 2) {
      bagianIbu = totalHarta * (1 / 6);
    } else {
      bagianIbu = totalHarta * (1 / 3);
    }
  }

  let bagianAyah = 0;
  let asobahAyah = 0;
  if (ayah > 0) {
    if (anakL + anakP > 0) {
      bagianAyah = totalHarta * (1 / 6); // Fardh
    } else {
      bagianAyah = totalHarta * (1 / 6);
      asobahAyah = 1; // Dia berhak atas sisa
    }
  }

  let totalFurudh = bagianSuami + bagianIstri + bagianIbu + bagianAyah;
  let sisa = totalHarta - totalFurudh;

  // Perhitungan bagian saudara seayah
  let bagianSaudaraSeayahL = 0;
  let bagianSaudaraSeayahP = 0;
  if (saudaraL + saudaraP > 0 && !(ayah > 0 && (anakL + anakP > 0))) {
    bagianSaudaraSeayahL = sisa / (saudaraL + saudaraP); // Pembagian bagian secara merata
    bagianSaudaraSeayahP = bagianSaudaraSeayahL;
    sisa = 0;
  }

  // Anak dapat asobah jika ada
  let bagianLaki = 0;
  let bagianPerempuan = 0;
  const totalBagianAnak = anakL * 2 + anakP;
  if (totalBagianAnak > 0) {
    const bagianUnit = sisa / totalBagianAnak;
    bagianLaki = bagianUnit * 2;
    bagianPerempuan = bagianUnit;
    sisa = 0;
  } else if (asobahAyah) {
    bagianAyah += sisa;
    sisa = 0;
  }

  // Tampilkan hasil
  let hasilHTML = `<h3>Hasil Perhitungan:</h3>`;
  if (suami) hasilHTML += `<div class="result-item"><span>- Suami</span><span>${formatCurrency(bagianSuami)}</span></div>`;
  if (istri) hasilHTML += `<div class="result-item"><span>- Istri</span><span>${formatCurrency(bagianIstri)}</span></div>`;
  if (ayah) hasilHTML += `<div class="result-item"><span>- Ayah</span><span>${formatCurrency(bagianAyah)}</span></div>`;
  if (ibu) hasilHTML += `<div class="result-item"><span>- Ibu</span><span>${formatCurrency(bagianIbu)}</span></div>`;
  if (anakL > 0) hasilHTML += `<div class="result-item"><span>- Anak Laki-laki (${anakL})</span><span>${formatCurrency(bagianLaki * anakL)}</span></div>`;
  if (anakP > 0) hasilHTML += `<div class="result-item"><span>- Anak Perempuan (${anakP})</span><span>${formatCurrency(bagianPerempuan * anakP)}</span></div>`;
  if (saudaraL > 0) hasilHTML += `<div class="result-item"><span>- Saudara Seayah Laki-laki (${saudaraL})</span><span>${formatCurrency(bagianSaudaraSeayahL * saudaraL)}</span></div>`;
  if (saudaraP > 0) hasilHTML += `<div class="result-item"><span>- Saudara Seayah Perempuan (${saudaraP})</span><span>${formatCurrency(bagianSaudaraSeayahP * saudaraP)}</span></div>`;

  if (sisa > 0) {
    hasilHTML += `<div class="result-item"><span>- Sisa Tidak Terbagi</span><span>${formatCurrency(sisa)}</span></div>`;
  }

  hasilHTML += `<h4>Catatan Hukum:</h4><ul>${catatan.map(c => `<li>${c}</li>`).join('')}</ul>`;
  document.getElementById('hasil').innerHTML = hasilHTML;
});
