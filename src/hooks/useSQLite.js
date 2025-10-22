import { useState, useEffect } from 'react';
import SQLiteService from '../database/SQLiteService';

// Custom hook for master data
export const useMasterData = () => {
  const [data, setData] = useState({
    penyewa: [],
    equipment: [],
    shift: [],
    kegiatan: [],
    lokasi: [],
    material: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [penyewa, equipment, shift, kegiatan, lokasi, material] = await Promise.all([
        SQLiteService.getPenyewa(),
        SQLiteService.getEquipment(),
        SQLiteService.getShift(),
        SQLiteService.getKegiatan(),
        SQLiteService.getLokasi(),
        SQLiteService.getMaterial(),
      ]);
      
      setData({ penyewa, equipment, shift, kegiatan, lokasi, material });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
};

// Individual service hooks
export const usePenyewa = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await SQLiteService.getPenyewa();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
};

export const useEquipment = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await SQLiteService.getEquipment();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
};

export const useKegiatan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await SQLiteService.getKegiatan();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
};

export const useLokasi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await SQLiteService.getLokasi();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
};

export const useMaterial = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await SQLiteService.getMaterial();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, refetch: loadData };
};

// Custom hook for timesheets
export const useTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const data = await SQLiteService.getTimesheets();
      setTimesheets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets();
  }, []);

  return { timesheets, loading, error, refetch: loadTimesheets };
};

// Hook for getting timesheets by employee
export const useTimesheetByEmployee = (employeeId) => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTimesheets = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await SQLiteService.getTimesheetsByEmployee(employeeId);
      setTimesheets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets();
  }, [employeeId]);

  return { timesheets, loading, error, refetch: loadTimesheets };
};

// Export all hooks
export default {
  useMasterData,
  usePenyewa,
  useEquipment,
  useKegiatan,
  useLokasi,
  useMaterial,
  useTimesheets,
  useTimesheetByEmployee,
};