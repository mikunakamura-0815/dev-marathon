const { Pool } = require('pg');

const pool = new Pool({
  user: 'user_5041',
  host: 'db',
  database: 'crm_5041',
  password: 'password_5041',
  port: 5432,
});


const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 5041;

app.use(cors()); 
// JSONのボディを受け取れるようにする
app.use(express.json());


// 顧客登録エンドポイント
app.post('/add-customer', async (req, res) => {
  const { companyName, industry, contact, location } = req.body;

  try {
    await pool.query(
      'INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4)',
      [companyName, industry, contact, location]
    );
    console.log(`登録成功: ${companyName}, ${industry}, ${contact}, ${location}`);
    res.status(200).send('登録成功');
  } catch (err) {
    console.error('登録失敗:', err);
    res.status(500).send('登録失敗');
  }
});

// 顧客一覧を取得するエンドポイント
app.get('/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY customer_id');
    res.json(result.rows);
  } catch (err) {
    console.error('DB接続エラー:', err);
    res.status(500).json({ error: 'DB接続に失敗しました' });
  }
});


// 顧客詳細を取得するエンドポイント
app.get('/api/customer/:id', async (req, res) => {
  const customerId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT * FROM customers WHERE customer_id = $1',
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '顧客が見つかりませんでした' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('DBエラー:', err);
    res.status(500).json({ error: 'DBエラー' });
  }
});


// 動作確認用
app.get('/', (req, res) => {
  res.send('こんにちは、世界！これはテストです');
});

// 顧客削除エンドポイント
app.delete('/api/customer/:id', async (req, res) => {
  const customerId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM customers WHERE customer_id = $1', [customerId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '削除対象の顧客が見つかりません' });
    }

    console.log(`顧客ID ${customerId} を削除しました`);
    res.status(200).json({ message: '削除成功' });
  } catch (err) {
    console.error('削除エラー:', err);
    res.status(500).json({ error: 'サーバーエラーで削除できませんでした' });
  }
});


app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

// 顧客情報更新エンドポイント（12KM）
app.put('/api/customer/:id', async (req, res) => {
  const customerId = req.params.id;
  const { company_name, industry, contact, location } = req.body;

  try {
    const result = await pool.query(
      `UPDATE customers
       SET company_name = $1,
           industry = $2,
           contact = $3,
           location = $4,
           updated_date = NOW()
       WHERE customer_id = $5`,
      [company_name, industry, contact, location, customerId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '顧客が見つかりません' });
    }

    console.log(`顧客ID ${customerId} を更新しました`);
    res.status(200).json({ message: '更新成功' });
  } catch (err) {
    console.error('更新エラー:', err);
    res.status(500).json({ error: 'サーバーエラーで更新できませんでした' });
  }
});
