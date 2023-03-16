const express = require("express");
const Sequelize = require("sequelize");
const moment = require("moment");
const Joi = require("joi").extend(require("@joi/date"));
const { QueryTypes } = require("sequelize");

const app = express();
const sequelize = new Sequelize("t4_soa_220116919", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
  timezone: "+07:00",
});

app.use(express.urlencoded({ extended: true }));

function dateFormat(date) {
  return moment(date, "DD/MM/YYYY HH:mm").format("DD MMMM YYYY HH:mm");
}

async function checkEmailUnique(email) {
  const result = await sequelize.query("SELECT * FROM users WHERE email = ?", {
    type: QueryTypes.SELECT,
    replacements: [email],
  });
  if (result.length > 0) {
    throw new Error("Email harus unik");
  }
}

async function generateIdUser() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const keyword = `${year}${month}%`;

  const result = await sequelize.query(
    "SELECT COUNT(*) FROM users WHERE id LIKE ?",
    {
      type: QueryTypes.SELECT,
      replacements: [keyword],
    }
  );
  return `${year}${month}${(result[0]["COUNT(*)"] + 1)
    .toString()
    .padStart(3, "0")}`;
}

async function checkUserExist(user_id) {
  const result = await sequelize.query("SELECT * FROM users WHERE id = ?", {
    type: QueryTypes.SELECT,
    replacements: [user_id],
  });
  if (result.length === 0) {
    throw new Error("User yang dicari tidak terdaftar");
  }
}

async function checkNIK(NIK, user_id) {
  const result = await sequelize.query("SELECT NIK FROM users WHERE id = ?", {
    type: QueryTypes.SELECT,
    replacements: [user_id],
  });
  if (result[0].NIK !== NIK) {
    throw new Error("NIK tidak sesuai dengan yang terdaftar!");
  }
}

async function getUser(user_id) {
  const result = await sequelize.query("SELECT * FROM users WHERE id = ?", {
    type: QueryTypes.SELECT,
    replacements: [user_id],
  });
  return result[0];
}

async function getAllUser() {
  const result = await sequelize.query("SELECT * FROM users ORDER BY id ASC", {
    type: QueryTypes.SELECT,
  });
  return result;
}

async function generateIdKonser() {
  const result = await sequelize.query("SELECT COUNT(*) FROM konser", {
    type: QueryTypes.SELECT,
  });
  return `KR${(result[0]["COUNT(*)"] + 1).toString().padStart(3, "0")}`;
}

async function getAllKonser() {
  const result = await sequelize.query("SELECT * FROM konser ORDER BY id ASC", {
    type: QueryTypes.SELECT,
  });
  return result;
}

async function getKonser(konser_id) {
  const result = await sequelize.query("SELECT * FROM konser WHERE id = ?", {
    type: QueryTypes.SELECT,
    replacements: [konser_id],
  });
  return result[0];
}

async function checkKonserExist(id_konser) {
  const result = await sequelize.query("SELECT * FROM konser WHERE id = ?", {
    type: QueryTypes.SELECT,
    replacements: [id_konser],
  });
  if (result.length === 0) {
    throw new Error("Konser yang dicari tidak terdaftar");
  }
}

async function checkEmail(email, user_id) {
  const result = await sequelize.query("SELECT email FROM users WHERE id = ?", {
    type: QueryTypes.SELECT,
    replacements: [user_id],
  });
  if (result[0].email !== email) {
    throw new Error("Verifikasi akun user gagal!");
  }
}

async function getHticket(konser_id, user_id) {
  const result = await sequelize.query(
    "SELECT * FROM hticket WHERE konser_id = ? AND users_id = ?",
    {
      type: QueryTypes.SELECT,
      replacements: [konser_id, user_id],
    }
  );
  return result[0];
}

async function getUserTicket(user_id) {
  const result = await sequelize.query(
    "SELECT konser_id, jumlah FROM hticket WHERE users_id = ?",
    {
      type: QueryTypes.SELECT,
      replacements: [user_id],
    }
  );
  return result;
}

// NOMOR 1
app.post("/api/users", async (req, res) => {
  const { email, NIK, nama_lengkap, no_telpon, tanggal_lahir } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().external(checkEmailUnique).required().messages({
      "string.email": "Email harus valid",
    }),
    NIK: Joi.string()
      .pattern(/^[0-9]+$/)
      .length(16)
      .required()
      .messages({
        "string.pattern.base": "NIK harus angka",
        "string.length": "NIK harus tepat 16 digit",
      }),
    nama_lengkap: Joi.string().required(),
    no_telpon: Joi.number().min(1000000000).required().messages({
      "number.base": "Nomor telepon harus angka",
      "number.min": "Nomor telepon minimal 10 digit",
    }),
    tanggal_lahir: Joi.date().format("DD/MM/YYYY").required().messages({
      "date.format": "Tanggal lahir harus tanggal dengan format DD/MM/YYYY",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // GENERATE ID USER YYMMXXX
  const id = await generateIdUser();

  // INSERT INTO USERS
  await sequelize.query(
    `INSERT INTO users (id, email, NIK, nama_lengkap, no_telpon, tanggal_lahir) VALUES (?, ?, ?, ?, ?, ?)`,
    {
      replacements: [id, email, NIK, nama_lengkap, no_telpon, tanggal_lahir],
    }
  );

  return res.status(201).send({
    id,
    email,
    NIK,
    nama_lengkap,
    no_telpon,
    tanggal_lahir,
    saldo: "Rp 0",
  });
});

// NOMOR 2
app.post("/api/topup", async (req, res) => {
  const { user_id, NIK, nominal } = req.body;

  const schema = Joi.object({
    user_id: Joi.string().external(checkUserExist).required(),
    NIK: Joi.string()
      .required()
      .external(async (value) => {
        await checkNIK(value, user_id);
      }),
    nominal: Joi.number().greater(10000).required().messages({
      "number.base": "Nominal saldo harus angka",
      "number.greater": "Nominal saldo nilainya harus di atas 10000",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  await sequelize.query(`UPDATE users SET saldo = saldo + ? WHERE id = ?`, {
    replacements: [nominal, user_id],
  });

  const user = await getUser(user_id);

  return res.status(201).send({
    id: user_id,
    email: user.email,
    NIK: NIK,
    nama_lengkap: user.nama_lengkap,
    saldo_baru: `Rp ${user.saldo}`,
  });
});

// NOMOR 3
app.post("/api/konser", async (req, res) => {
  const { nama_konser, nama_artis, tempat, tanggal, harga } = req.body;

  const schema = Joi.object({
    nama_konser: Joi.string().min(4).required().messages({
      "string.min": "Nama konser harus di atas 3 huruf",
    }),
    nama_artis: Joi.string().required(),
    tempat: Joi.string().required(),
    tanggal: Joi.date()
      .format("DD/MM/YYYY HH:mm")
      .greater(new Date().setMonth(new Date().getMonth() + 1))
      .required()
      .messages({
        "date.format":
          "Tanggal konser harus tanggal dengan format DD/MM/YYYY HH:mm",
        "date.greater": "Tanggal konser harus di atas 1 bulan dari sekarang",
      }),
    harga: Joi.number().greater(50000).required().messages({
      "number.base": "Harga tiket harus berupa angka",
      "number.greater": "Harga tiket harus di atas 50000",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // GENERATE ID KONSER KRXXX
  const id = await generateIdKonser();

  // INSERT INTO KONSER
  await sequelize.query(
    `INSERT INTO konser (id, nama_konser, nama_artis, tempat, tanggal, harga) VALUES (?, ?, ?, ?, ?, ?)`,
    {
      replacements: [
        id,
        nama_konser,
        nama_artis,
        tempat,
        dateFormat(tanggal),
        harga,
      ],
    }
  );

  return res.status(201).send({
    id,
    nama_konser,
    nama_artis,
    tempat,
    tanggal: dateFormat(tanggal),
    harga: `Rp ${harga}`,
    penonton: 0,
  });
});

// NOMOR 4
app.get("/api/konser/:id?", async (req, res) => {
  const { id } = req.params;

  if (id !== undefined && id !== ":id") {
    const konser = await getKonser(id);

    const jumlah = await sequelize.query(
      `SELECT SUM(jumlah) AS penonton FROM hticket WHERE konser_id = ?`,
      {
        type: QueryTypes.SELECT,
        replacements: [id],
      }
    );

    if (konser) {
      return res.status(200).send({
        id: konser.id,
        nama_konser: konser.nama_konser,
        nama_artis: konser.nama_artis,
        tempat: konser.tempat,
        tanggal: konser.tanggal,
        harga: konser.harga,
        penonton: jumlah[0].penonton ?? 0,
      });
    } else {
      return res.status(404).send({ message: "Konser tidak ditemukan" });
    }
  }

  const konsers = await getAllKonser();
  for (let i = 0; i < konsers.length; i++) {
    let jumlah = await sequelize.query(
      `SELECT SUM(jumlah) AS penonton FROM hticket WHERE konser_id = ?`,
      {
        type: QueryTypes.SELECT,
        replacements: [konsers[i].id],
      }
    );
    konsers[i].penonton = jumlah[0].penonton ?? 0;
  }

  return res.status(200).send(konsers);
});

// NOMOR 5
app.post("/api/tickets", async (req, res) => {
  const { id_konser, id_user, jumlah, email } = req.body;

  const schema = Joi.object({
    id_konser: Joi.string().external(checkKonserExist).required(),
    id_user: Joi.string().external(checkUserExist).required(),
    jumlah: Joi.number().greater(0).required().messages({
      "number.base": "Jumlah tiket harus berupa angka",
      "number.greater": "Jumlah tiket harus di atas 0",
    }),
    email: Joi.string()
      .email()
      .required()
      .external(async (value) => {
        await checkEmail(value, id_user);
      }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  const konser = await getKonser(id_konser);
  const user = await getUser(id_user);

  const total_harga = konser.harga * jumlah;

  // CHECK SALDO
  if (user.saldo < total_harga) {
    return res.status(400).send({ message: "Saldo tidak cukup" });
  }

  // UPDATE SALDO
  await sequelize.query(`UPDATE users SET saldo = saldo - ? WHERE id = ?`, {
    replacements: [total_harga, id_user],
  });

  // INSERT / UPDATE HTICKET
  const hticket = await getHticket(id_konser, id_user);

  if (hticket) {
    // UPDATE
    await sequelize.query(
      `UPDATE hticket SET jumlah = jumlah + ?, total = total + ? WHERE konser_id = ? AND users_id = ?`,
      {
        replacements: [jumlah, total_harga, id_konser, id_user],
      }
    );
  } else {
    // INSERT
    await sequelize.query(
      `INSERT INTO hticket (konser_id, users_id, jumlah, total) VALUES (?, ?, ?, ?, ?)`,
      {
        replacements: [id_konser, id_user, jumlah, total_harga],
      }
    );
  }

  // GENERATE TICKET ID
  let tickets = [];
  for (let i = 0; i < jumlah; i++) {
    tickets.push(`TK${(i + 1).toString().padStart(5, "0")}`);
  }

  return res.status(201).send({
    konser: konser.nama_konser,
    nama_user: user.nama_lengkap,
    jumlah,
    total_harga,
    tiket: tickets,
  });
});

// NOMOR 6
app.post("/api/tickets/refund", async (req, res) => {
  const { id_konser, id_user, jumlah, email } = req.body;

  const schema = Joi.object({
    id_konser: Joi.string().external(checkKonserExist).required(),
    id_user: Joi.string().external(checkUserExist).required(),
    jumlah: Joi.number().greater(0).required().messages({
      "number.base": "Jumlah tiket harus berupa angka",
      "number.greater": "Jumlah tiket harus di atas 0",
    }),
    email: Joi.string()
      .email()
      .required()
      .external(async (value) => {
        await checkEmail(value, id_user);
      }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  const konser = await getKonser(id_konser);
  const hticket = await getHticket(id_konser, id_user);

  const total_harga = 0.9 * konser.harga * jumlah;

  if (hticket.jumlah < jumlah) {
    return res.status(400).send({ message: "Jumlah tiket tidak cukup" });
  }

  // UPDATE SALDO
  await sequelize.query(`UPDATE users SET saldo = saldo + ? WHERE id = ?`, {
    replacements: [total_harga, id_user],
  });

  // UPDATE HTICKET
  await sequelize.query(`UPDATE hticket SET jumlah = jumlah - ? WHERE id = ?`, {
    replacements: [jumlah, hticket.id],
  });

  return res.status(200).send({
    message: `Tiket berhasil direfund dan saldo bertambah Rp ${total_harga}`,
  });
});

// NOMOR 7
app.get("/api/users/:id?", async (req, res) => {
  const { id } = req.params;

  if (id !== undefined && id !== ":id") {
    const user = await getUser(id);
    const tickets = await getUserTicket(id);

    for (let i = 0; i < tickets.length; i++) {
      let konser = await getKonser(tickets[i].konser_id).then((response) => {
        return response.nama_konser;
      });
      delete tickets[i].konser_id;
      tickets[i] = { konser, ...tickets[i] };
    }

    if (user) {
      return res.status(200).send({
        id: user.id,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        tanggal_lahir: user.tanggal_lahir,
        saldo: `Rp ${user.saldo}`,
        tickets,
      });
    }

    return res.status(404).send({ message: "User tidak ditemukan" });
  }

  const users = await getAllUser();
  for (let i = 0; i < users.length; i++) {
    let tickets = await getUserTicket(users[i].id);
    for (let j = 0; j < tickets.length; j++) {
      let konser = await getKonser(tickets[j].konser_id).then((response) => {
        return response.nama_konser;
      });
      delete tickets[j].konser_id;
      tickets[j] = { konser, ...tickets[j] };
    }
    delete users[i].NIK;
    delete users[i].no_telpon;
    users[i].saldo = `Rp ${users[i].saldo}`;
    users[i].tickets = tickets;
  }

  return res.status(200).send(users);
});

app.listen(3000, () => console.log("listening at port 3000"));
