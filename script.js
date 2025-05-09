function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.round(value));
}

// form input number functionallitiy
document.querySelectorAll(".form-row.number-input").forEach((row) => {
  const decrement = row.querySelector(".decrement");
  const increment = row.querySelector(".increment");
  const input = row.querySelector(".number-field");

  decrement.addEventListener("click", () => {
    input.value = Math.max(0, parseInt(input.value || "0") - 1);
  });

  increment.addEventListener("click", () => {
    input.value = parseInt(input.value || "0") + 1;
  });

  // Hanya izinkan angka
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, "");
  });
});
console.log(document.getElementById("harta"));
document.getElementById("harta").addEventListener("input", function (e) {
  document.getElementById("formatted").innerHTML = formatCurrency(
    e.target.value
  );
});

document.getElementById("form-waris").addEventListener("submit", function (e) {
  const catatan = [];
  e.preventDefault();
  if (document.getElementById("harta").value == 0) {
    catatan.push("Tidak ada harta untuk dibagi");
    document.getElementById("hasil").innerHTML = "";
  }

  const totalHarta =
    parseInt(document.getElementById("harta").value.replace(/\./g, "")) || 0;
  let suami = +document.getElementById("suami").value || 0;
  let istri = +document.getElementById("istri").value || 0;
  let ayah = +document.getElementById("ayah").value || 0;
  let ibu = +document.getElementById("ibu").value || 0;
  let anakL = +document.getElementById("anakL").value || 0;
  let anakP = +document.getElementById("anakP").value || 0;
  let cucuL = +document.getElementById("cucuL").value || 0;
  let cucuP = +document.getElementById("cucuP").value || 0;
  let saudaraL = +document.getElementById("saudaraL").value || 0;
  let saudaraP = +document.getElementById("saudaraP").value || 0;

  // Tampilkan hasil
  // Gugurkan cucu jika ada anak kandung
  let hasilHTML = `<h3>Hasil Perhitungan:</h3>`;
  if (istri > 0 && suami > 0) {
    catatan.push(
      "Tidak mungkin ada orang punya suami dan istri sekaligus, cek kembali"
    );
    hasilHTML += `<h4>Catatan Hukum:</h4><ul>${catatan
      .map((c) => `<li>${c}</li>`)
      .join("")}</ul>`;
    document.getElementById("hasil").innerHTML = hasilHTML;
    return;
  }
  let isCucu = false;
  if (anakL > 0 || anakP > 0) {
    cucuL = 0;
    cucuP = 0;
    catatan.push("Cucu tidak mendapat warisan karena ada anak kandung.");
  }

  if (anakL + anakP === 0 && (cucuL > 0 || cucuP > 0)) {
    anakL = cucuL;
    anakP = cucuP;
    isCucu = true;
  }
  // Gugurkan saudara jika ada anak kandung (bukan hanya jika ada ayah dan anak)
  // Karena anak laki-laki sudah jadi asobah yang menghalangi saudara
  if (anakL + anakP > 0 && ayah > 0) {
    // 🔧 perbaikan: hapus syarat ayah > 0
    saudaraL = 0;
    saudaraP = 0;
    catatan.push(
      "Saudara kandung tidak mendapat warisan karena ada anak kandung."
    );
  }

  // Hitung bagian tetap
  let bagianSuami =
    suami > 0 ? totalHarta * (anakL + anakP > 0 ? 0.25 : 0.5) : 0;
  let bagianIstri =
    istri > 0 ? totalHarta * (anakL + anakP > 0 ? 0.125 : 0.25) : 0;
  let bagianIbu = 0;
  if (ibu > 0) {
    if (anakL + anakP > 0 || saudaraL + saudaraP >= 2) {
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

  // 💡 Perbaikan penting: jika ada anak, mereka adalah asobah, harus didahulukan
  // sebelum pembagian ke saudara. Jika tidak, anak bisa kehilangan bagian (bug sebelumnya)
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

  // Perhitungan bagian saudara hanya jika masih ada sisa dan tidak gugur
  // 🔧 perbaikan: sebelumnya saudara dihitung meskipun sudah digugurkan
  let bagianSaudaraSeayahL = 0;
  let bagianSaudaraSeayahP = 0;
  if (sisa > 0 && saudaraL + saudaraP > 0) {
    bagianSaudaraSeayahL = sisa / (saudaraL + saudaraP);
    bagianSaudaraSeayahP = bagianSaudaraSeayahL;
    sisa = 0;
  }

  if (suami)
    hasilHTML += `<div class="result-item"><span>- Suami</span><span>${formatCurrency(
      bagianSuami
    )}</span></div>`;
  if (istri)
    hasilHTML += `<div class="result-item"><span>- Istri</span><span>${formatCurrency(
      bagianIstri
    )}</span></div>`;
  if (ayah)
    hasilHTML += `<div class="result-item"><span>- Ayah</span><span>${formatCurrency(
      bagianAyah
    )}</span></div>`;
  if (ibu)
    hasilHTML += `<div class="result-item"><span>- Ibu</span><span>${formatCurrency(
      bagianIbu
    )}</span></div>`;
  if (anakL > 0)
    hasilHTML += `<div class="result-item"><span>- ${
      isCucu ? "Cucu Laki-laki" : "Anak Laki-laki"
    } (${anakL})</span><span>${formatCurrency(
      bagianLaki * anakL
    )}</span></div>`;
  if (anakP > 0)
    hasilHTML += `<div class="result-item"><span>-  ${
      isCucu ? "Cucu Perempuan" : "Anak Perempuan"
    } (${anakP})</span><span>${formatCurrency(
      bagianPerempuan * anakP
    )}</span></div>`;
  if (saudaraL > 0)
    hasilHTML += `<div class="result-item"><span>- Saudara Seayah Laki-laki (${saudaraL})</span><span>${formatCurrency(
      bagianSaudaraSeayahL * saudaraL
    )}</span></div>`;
  if (saudaraP > 0)
    hasilHTML += `<div class="result-item"><span>- Saudara Seayah Perempuan (${saudaraP})</span><span>${formatCurrency(
      bagianSaudaraSeayahP * saudaraP
    )}</span></div>`;

  if (sisa > 0) {
    hasilHTML += `<div class="result-item"><span>- Sisa Tidak Terbagi</span><span>${formatCurrency(
      sisa
    )}</span></div>`;
  }

  hasilHTML += `<h4>Catatan Hukum:</h4><ul>${catatan
    .map((c) => `<li>${c}</li>`)
    .join("")}</ul>`;
  document.getElementById("hasil").innerHTML = hasilHTML;
});
