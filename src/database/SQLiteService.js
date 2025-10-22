import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

class SQLiteService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.db = await SQLite.openDatabaseAsync('timesheet.db');
      await this.createTables();
      this.initialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Master Data Tables
      `CREATE TABLE IF NOT EXISTS kategoris (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS cabangs (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        initial TEXT,
        tipe TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS penyewas (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        abbr TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS equipments (
        id TEXT PRIMARY KEY,
        kode TEXT NOT NULL,
        nama TEXT NOT NULL,
        tipe TEXT,
        kategori TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        start_shift TEXT,
        end_shift TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS longshifts (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS kegiatans (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        level TEXT,
        type TEXT,
        grpequipment TEXT,
        grpmaterial TEXT,
        ctg TEXT,
        subctg TEXT,
        abbr TEXT,
        aktif TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS lokasis (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        cabang_id TEXT,
        kode TEXT,
        type TEXT,
        abbr TEXT,
        sts_jarak TEXT,
        aktif TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
       `CREATE TABLE IF NOT EXISTS materials (
         id TEXT PRIMARY KEY,
         nama TEXT NOT NULL,
         abbr TEXT,
         coefisien REAL,
         aktif TEXT,
         kategori TEXT,
         created_at INTEGER DEFAULT (strftime('%s', 'now')),
         updated_at INTEGER DEFAULT (strftime('%s', 'now'))
       )`,

       `CREATE TABLE IF NOT EXISTS koordinat_checklogs (
         id TEXT PRIMARY KEY,
         nama TEXT NOT NULL,
         cabang_id TEXT,
         kode TEXT,
         latitude REAL,
         longitude REAL,
         radius REAL,
         aktif TEXT,
         created_at INTEGER DEFAULT (strftime('%s', 'now')),
         updated_at INTEGER DEFAULT (strftime('%s', 'now'))
       )`,

       // Timesheet Tables
      `CREATE TABLE IF NOT EXISTS timesheets (
        id TEXT PRIMARY KEY,
        kode TEXT,
        tanggal TEXT,
        kategori TEXT,
        penyewa_id TEXT,
        equipment_id TEXT,
        shift_id TEXT,
        operator_id TEXT,
        smustart INTEGER,
        smufinish INTEGER,
        usedsmu INTEGER,
        bbm INTEGER,
        keterangan TEXT,
        status TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
       `CREATE TABLE IF NOT EXISTS kegiatan_items (
        id TEXT PRIMARY KEY,
        timesheet_id TEXT,
        kegiatan_id TEXT,
        material_id TEXT,
        lokasi_asal_id TEXT,
        lokasi_tujuan_id TEXT,
        starttime TEXT,
        endtime TEXT,
        smustart INTEGER,
        smufinish INTEGER,
        quantity INTEGER,
        timetot INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (timesheet_id) REFERENCES timesheets (id)
      )`,

      `CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY,
        feature TEXT NOT NULL,
        unique_key TEXT UNIQUE,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        err_code INTEGER,
        err_message TEXT,
        retry_count INTEGER DEFAULT 0,
        next_retry_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s','now')),
        updated_at INTEGER DEFAULT (strftime('%s','now'))
      )`
    ];

    for (const table of tables) {
      await this.db.execAsync(table);
    }
    
    console.log('All tables created successfully');
  }

  // Generic CRUD operations
  async insert(table, data) {
    try {
      await this.ensureInitialized();
      
      if (!table || !data) {
        throw new Error('Missing table or data for insert');
      }
      
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      if (!columns || !values.length) {
        throw new Error('No data to insert');
      }
      
      const result = await this.db.runAsync(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
        values
      );
      
      return result;
    } catch (error) {
      console.log(`[SQLiteService] Error inserting to ${table}:`, error?.message || error);
      // throw error;
      return null
    }
  }

  async update(table, data, id) {
    try {
      await this.ensureInitialized();
      
      if (!table || !data || !id) {
        throw new Error('Missing table, data, or id for update');
      }
      
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];
      
      if (!setClause) {
        throw new Error('No data to update');
      }
      
      const result = await this.db.runAsync(
        `UPDATE ${table} SET ${setClause}, updated_at = strftime('%s', 'now') WHERE id = ?`,
        values
      );
      
      return result;
    } catch (error) {
      console.log(`[SQLiteService] Error updating ${table}:`, error?.message || error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized || !this.db) {
      console.log('[SQLiteService] Database not initialized, initializing now...');
      await this.init();
    }
  }

  async upsert(table, data) {
    try {
      await this.ensureInitialized();
      
      if (!data || !data.id) {
        throw new Error(`Invalid data for upsert: missing id`);
      }
      
      const existing = await this.getById(table, data.id);
      if (existing) {
        return await this.update(table, data, data.id);
      } else {
        return await this.insert(table, data);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.log(`[SQLiteService] Error upserting to ${table}:`, errorMessage);
      console.log(`[SQLiteService] Error details:`, error);
      // throw new Error(`Failed to upsert to ${table}: ${errorMessage}`);
      return null
    }
  }

  async getById(table, id) {
    try {
      await this.ensureInitialized();
      
      if (!table || !id) {
        console.warn('[SQLiteService] getById missing table or id:', { table, id });
        return null;
      }
      const result = await this.db.getFirstAsync(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      return result;
    } catch (error) {
      console.error(`[SQLiteService] Error getting by id from ${table}:`, error?.message || error);
      return null;
    }
  }

  async getAll(table) {
    await this.ensureInitialized();
    const result = await this.db.getAllAsync(`SELECT * FROM ${table} ORDER BY created_at DESC`);
    return result;
  }

  async query(table, whereClause, params = []) {
    await this.ensureInitialized();
    const result = await this.db.getAllAsync(`SELECT * FROM ${table} WHERE ${whereClause}`, params);
    return result;
  }

  async delete(table, id) {
    const result = await this.db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return result;
  }

  async clear(table) {
    const result = await this.db.runAsync(`DELETE FROM ${table}`);
    return result;
  }

  // Master Data Services
  async getPenyewa() {
    return await this.getAll('penyewas');
  }

  async syncPenyewa(data) {
    let successCount = 0;
    for (const item of data) {
      try {
        await this.upsert('penyewas', {
          id: item.id.toString(),
          nama: item.nama || '',
          abbr: item.abbr || ''
        });
        successCount++;
      } catch (error) {
        console.error('[SQLiteService] Error syncing penyewa item:', error);
      }
    }
    return { successCount };
  }

  async getEquipment() {
    return await this.getAll('equipments');
  }

  async syncEquipment(data) {
    let successCount = 0;
    for (const item of data) {
      try {
        await this.upsert('equipments', {
          id: item.id.toString(),
          kode: item.kode || '',
          nama: item.nama || '',
          tipe: item.tipe || '',
          kategori: item.kategori || ''
        });
        successCount++;
      } catch (error) {
        console.error('[SQLiteService] Error syncing equipment item:', error);
      }
    }
    return { successCount };
  }

  async getShift() {
    return await this.getAll('shifts');
  }

  async syncShift(data) {
    let successCount = 0;
    for (const item of data) {
      try {
        await this.upsert('shifts', {
          id: item.id.toString(),
          nama: item.nama || '',
          kode: item.kode || '',
          start_shift: item.start_shift || '',
          end_shift: item.end_shift || ''
        });
        successCount++;
      } catch (error) {
        console.error('[SQLiteService] Error syncing shift item:', error);
      }
    }
    return { successCount };
  }

  async getKegiatan() {
    const result = await this.getAll('kegiatans');
    return result;
  }

  async syncKegiatan(data) {
    
    let successCount = 0;
    
    for (const item of data) {
      if (!item.id) {
        continue;
      }
      
      try {
        await this.upsert('kegiatans', {
          id: item.id.toString(),
          nama: item.nama || '',
          level: item.level || '',
          type: item.type || '',
          grpequipment: item.grpequipment || '',
          grpmaterial: item.grpmaterial || '',
          ctg: item.ctg || '',
          subctg: item.subctg || '',
          abbr: item.abbr || '',
          aktif: item.aktif || ''
        });
        successCount++;
      } catch (error) {
        console.error('[SQLiteService] Error syncing kegiatan item:', error);
      }
    }
    
    return { successCount };
  }

  async getLokasi() {
    const result = await this.getAll('lokasis');
    return result;
  }

  async syncLokasi(data) {
    try {
      
      if (!Array.isArray(data)) {
        return { successCount: 0 };
      }
      
      let successCount = 0;
      
      for (const item of data) {
        if (!item || !item.id) {
          console.warn('[SQLiteService] Lokasi item missing id:', item);
          continue;
        }
        
        try {
          await this.upsert('lokasis', {
            id: item.id.toString(),
            nama: item.nama || '',
            cabang_id: item.cabang_id?.toString() || '',
            kode: item.kode || '',
            type: item.type || '',
            abbr: item.abbr || '',
            sts_jarak: item.sts_jarak || '',
            aktif: item.aktif || ''
          });
          successCount++;
        } catch (error) {
          console.error('[SQLiteService] Error syncing lokasi item:', error.message);
          // continue syncing other items
        }
      }
      
      return { successCount };
    } catch (error) {
      return { successCount: 0, error: error.message };
    }
  }

  async getMaterial() {
    return await this.getAll('materials');
  }

  async syncMaterial(data) {
    
    let successCount = 0;
    
    for (const item of data) {
      if (!item.id) {
        console.warn('[SQLiteService] Material item missing id:', item);
        continue;
      }
      
      try {
        await this.upsert('materials', {
          id: item.id.toString(),
          nama: item.nama || '',
          abbr: item.abbr || '',
          coefisien: item.coefisien || 0,
          aktif: item.aktif || '',
          kategori: item.kategori || ''
        });
        successCount++;
      } catch (error) {
        console.error('[SQLiteService] Error syncing material item:', error);
      }
    }
    
    return { successCount };
  }

  async getKoordinatChecklog() {
    return await this.getAll('koordinat_checklogs');
  }

  async syncKoordinatChecklog(data) {
    try {

      if (!Array.isArray(data)) {
        return { successCount: 0 };
      }

      let successCount = 0;

      for (const item of data) {
        if (!item || !item.id) {
          console.warn('[SQLiteService] KoordinatChecklog item missing id:', item);
          continue;
        }

        try {
          await this.upsert('koordinat_checklogs', {
            id: item.id.toString(),
            nama: item.nama || '',
            cabang_id: item.cabang_id?.toString() || '',
            kode: item.kode || '',
            latitude: item.latitude || 0,
            longitude: item.longitude || 0,
            radius: item.radius || 0,
            aktif: item.aktif || ''
          });
          successCount++;
        } catch (error) {
          console.error('[SQLiteService] Error syncing koordinatChecklog item:', error.message);
          // continue syncing other items
        }
      }

      return { successCount };
    } catch (error) {
      return { successCount: 0, error: error.message };
    }
  }

  // Outbox Services
  async outboxEnqueue(feature, uniqueKey, payload) {
    await this.ensureInitialized();
    const size = await this.db.getFirstAsync(`SELECT COUNT(1) as c FROM outbox WHERE feature = ?`, [feature]);
    if ((size?.c || 0) >= 30) return null;
    const row = {
      id: uniqueKey,
      feature,
      unique_key: uniqueKey,
      payload: JSON.stringify(payload),
      status: 'pending',
      retry_count: 0,
      next_retry_at: Math.floor(Date.now()/1000) + 60,
    };
    return this.insert('outbox', row);
  }

  async outboxList(feature) {
    await this.ensureInitialized();
    if (feature) return this.query('outbox', 'feature = ?', [feature]);
    return this.getAll('outbox');
  }

  async outboxDelete(id) {
    return this.delete('outbox', id);
  }

  async outboxDue(nowTs = Math.floor(Date.now()/1000)) {
    return this.query('outbox', 'status = ? AND next_retry_at <= ?', ['pending', nowTs]);
  }

  // Timesheet Services
  async getTimesheets() {
    return await this.getAll('timesheets');
  }

  async getTimesheetsByEmployee(employeeId) {
    return await this.query('timesheets', 'operator_id = ?', [employeeId]);
  }

  async getTimesheet(id) {
    return await this.getById('timesheets', id);
  }

  // Additional sync functions for download feature
  async syncKategori(data) {
    const batch = [];
    for (const item of data) {
      batch.push(this.upsert('kategoris', {
        id: item.id,
        nama: item.nama
      }));
    }
    return await Promise.all(batch);
  }

  async syncCabang(data) {
    let successCount = 0;
    for (const item of data) {
      try {
        await this.upsert('cabangs', {
          id: item.id.toString(),
          nama: item.nama || '',
          kode: item.kode || '',
          initial: item.initial || '',
          tipe: item.tipe || ''
        });
        successCount++;
      } catch (error) {
        console.error('[SQLiteService] Error syncing cabang item:', error);
      }
    }
    return { successCount };
  }

  async syncLongshift(data) {
    console.log('[SQLiteService] Syncing longshift data:', data.length, 'items');
    let successCount = 0;
    
    for (const item of data) {
      if (!item.id) {
        console.warn('[SQLiteService] Longshift item missing id:', item);
        continue;
      }
      
      try {
        await this.upsert('longshifts', {
          id: item.id.toString(),
          nama: item.nama || '',
          kode: item.kode || ''
        });
        successCount++;
      } catch (error) {
        console.error('[SQLiteService] Error syncing longshift item:', error);
      }
    }
    
    console.log('[SQLiteService] Longshift sync completed:', successCount, 'items');
    return { successCount };
  }

  async syncTimesheetTop10(data) {
    try {
      console.log('[SQLiteService] Syncing timesheet top 10 data:', data?.length || 0, 'items');
      
      if (!Array.isArray(data)) {
        console.warn('[SQLiteService] Invalid data format for timesheet, expected array');
        return { successCount: 0 };
      }
      
      if (data.length > 0) {
        console.log('[SQLiteService] Sample timesheet item:', data[0]);
      }
      
      let successCount = 0;
      
      for (const item of data) {
        if (!item || !item.id) {
          console.warn('[SQLiteService] Timesheet item missing id:', item);
          continue;
        }
        
        try {
          await this.upsert('timesheets', {
            id: item.id.toString(),
            kode: item.kode || '',
            tanggal: item.tanggal || '',
            kategori: item.kategori || '',
            penyewa_id: item.penyewa_id?.toString() || '',
            equipment_id: item.equipment_id?.toString() || '',
            shift_id: item.shift_id?.toString() || '',
            operator_id: item.operator_id?.toString() || '',
            smustart: item.smustart || 0,
            smufinish: item.smufinish || 0,
            usedsmu: item.usedsmu || 0,
            bbm: item.bbm || 0,
            keterangan: item.keterangan || '',
            status: item.status || ''
          });
          successCount++;
        } catch (error) {
          console.error('[SQLiteService] Error syncing timesheet item:', error.message);
        }
      }
      
      console.log('[SQLiteService] Timesheet sync completed:', successCount, 'items');
      return { successCount };
    } catch (error) {
      console.error('[SQLiteService] Critical error in syncTimesheetTop10:', error.message);
      return { successCount: 0, error: error.message };
    }
  }

  async createTimesheet(data) {
    return await this.insert('timesheets', data);
  }

  async updateTimesheet(data, id) {
    return await this.update('timesheets', data, id);
  }

  async getKegiatanItems(timesheetId) {
    return await this.query('kegiatan_items', 'timesheet_id = ?', [timesheetId]);
  }

  async createKegiatanItem(data) {
    return await this.insert('kegiatan_items', data);
  }

  // Fallback to AsyncStorage for critical data
  async saveToStorage(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  async getFromStorage(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get from storage:', error);
      return null;
    }
  }
}

export default new SQLiteService();