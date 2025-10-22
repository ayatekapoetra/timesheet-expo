import { useState, useEffect } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../database';
import { getMasterData } from '../database/utils';
import { 
  PenyewaService, 
  EquipmentService, 
  ShiftService, 
  KegiatanService, 
  LokasiService, 
  MaterialService,
  TimesheetService 
} from '../database/services';

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
      const masterData = await getMasterData();
      setData(masterData);
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await PenyewaService.getAll();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error, refetch: () => PenyewaService.getAll().then(setData) };
};

export const useEquipment = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await EquipmentService.getAll();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error, refetch: () => EquipmentService.getAll().then(setData) };
};

export const useKegiatan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await KegiatanService.getAll();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error, refetch: () => KegiatanService.getAll().then(setData) };
};

export const useLokasi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await LokasiService.getAll();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error, refetch: () => LokasiService.getAll().then(setData) };
};

export const useMaterial = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await MaterialService.getAll();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error, refetch: () => MaterialService.getAll().then(setData) };
};

// Custom hook for timesheets
export const useTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const data = await TimesheetService.getAll();
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

// Custom hook for single timesheet with kegiatan items
export const useTimesheet = (id) => {
  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTimesheet = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await TimesheetService.getWithKegiatan(id);
      setTimesheet(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheet();
  }, [id]);

  return { timesheet, loading, error };
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
      const data = await TimesheetService.getByEmployee(employeeId);
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

// Export all hooks as default
export default {
  useMasterData,
  usePenyewa,
  useEquipment,
  useKegiatan,
  useLokasi,
  useMaterial,
  useTimesheets,
  useTimesheet,
  useTimesheetByEmployee,
  withDatabase: (WrappedComponent, collections = []) => {
    return withObservables(collections, (props) => ({
      ...props,
      // Add observed collections here
    }))(WrappedComponent);
  },
};