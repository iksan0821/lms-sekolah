export default async function run(page, ui) {
  await page.goto("http://localhost:3000/masuk");
  await page.getByRole("button", { name: "Siswa", exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Siswa: siswa" }).click();
  await page.waitForTimeout(200);
  await page.locator("input").first().fill("ican");
  // password demo siswa123 - coba
  await page.locator('input[type="password"]').fill("siswa123");
  const selects = page.locator("select");
  await selects.nth(0).selectOption("10");
  await selects.nth(1).selectOption("5");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForTimeout(4000);
  const hasil = { url: page.url(), body: (await page.locator("body").innerText()).slice(0, 1200) };
  // kalau berhasil login, buka tiap halaman siswa
  if (page.url().includes("/siswa")) {
    for (const p of ["asesmen", "mapel", "tugas"]) {
      await page.goto("http://localhost:3000/siswa/" + p);
      await page.waitForTimeout(2500);
      hasil[p] = (await page.locator("body").innerText()).slice(0, 600);
    }
  }
  return hasil;
}
