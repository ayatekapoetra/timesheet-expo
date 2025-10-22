import * as Yup from 'yup';

export const timesheetValidationSchema = Yup.object().shape({
  tanggal: Yup.date().required('Tanggal wajib diisi'),
  activity: Yup.string().required('Kategori wajib dipilih'),
  cabang_id: Yup.string().required('Cabang wajib dipilih'),
  penyewa_id: Yup.string().required('Penyewa wajib dipilih'),
  equipment_id: Yup.string().required('Equipment wajib dipilih'),
  shift_id: Yup.string().required('Shift wajib dipilih'),
  longshift_id: Yup.string().nullable(),
  karyawan_id: Yup.string().required('Karyawan wajib dipilih'),
  smustart: Yup.number()
    .typeError('HM/KM Start harus angka')
    .min(0, 'HM/KM Start tidak boleh negatif')
    .required('HM/KM Start wajib diisi'),
  smufinish: Yup.number()
    .typeError('HM/KM Finish harus angka')
    .required('HM/KM Finish wajib diisi')
    .min(
      Yup.ref('smustart'),
      'HM/KM Finish tidak boleh lebih kecil dari Start',
    ),
  usedsmu: Yup.number()
    .typeError('HM/KM Used harus angka')
    .required('HM/KM Used wajib diisi'),
  bbm: Yup.number()
    .typeError('Refuel BBM harus angka')
    .min(0, 'Refuel BBM tidak boleh negatif')
    .required('Refuel BBM wajib diisi'),
  equipment_tool: Yup.string().nullable(),
  keterangan: Yup.string().nullable(),
  foto: Yup.array().nullable(),
  kegiatan: Yup.array()
    .of(
      Yup.object().shape({
        kegiatan_id: Yup.string().required('Jenis kegiatan wajib dipilih'),
        material_id: Yup.string().nullable(),
        lokasi_asal_id: Yup.string().required('Lokasi asal wajib dipilih'),
        lokasi_tujuan_id: Yup.string().nullable(),
        starttime: Yup.string()
          .required('Waktu Start wajib diisi')
          .matches(
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
            'Format waktu harus YYYY-MM-DD HH:mm'
          ),
        endtime: Yup.string()
          .required('Waktu Finish wajib diisi')
          .matches(
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
            'Format waktu harus YYYY-MM-DD HH:mm'
          )
          .test(
            'is-after-start',
            'Waktu Finish harus lebih besar dari Start',
            function (value) {
              const { starttime } = this.parent;
              if (!value || !starttime) return true;
              return new Date(value) > new Date(starttime);
            }
          ),
        smustart: Yup.number()
          .typeError('HM/KM Start harus angka')
          .nullable()
          .min(0, 'HM/KM Start tidak boleh negatif'),
        smufinish: Yup.number()
          .typeError('HM/KM Finish harus angka')
          .nullable()
          .when('smustart', {
            is: (val) => val != null && val !== '',
            then: (schema) => schema.min(
              Yup.ref('smustart'),
              'HM/KM Finish harus lebih besar dari Start'
            ),
          }),
        ritase: Yup.number()
          .typeError('Ritase harus angka')
          .min(0, 'Ritase tidak boleh negatif')
          .required('Ritase wajib diisi'),
        seq: Yup.number().nullable(),
      })
    )
    .min(1, 'Minimal satu kegiatan harus diisi')
    .test(
      'no-overlap',
      'Kegiatan tidak boleh saling beririsan',
      function (kegiatanList) {
        if (!Array.isArray(kegiatanList) || kegiatanList.length < 2)
          return true;

        const sorted = [...kegiatanList].sort(
          (a, b) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime(),
        );

        for (let i = 0; i < sorted.length - 1; i++) {
          const currEnd = new Date(sorted[i].endtime);
          const nextStart = new Date(sorted[i + 1].starttime);
          if (currEnd > nextStart) {
            return this.createError({
              path: `kegiatan[${i + 1}].starttime`,
              message: 'Waktu kegiatan tumpang tindih dengan sebelumnya',
            });
          }
        }
        return true;
      },
    ),
});

export const getInitialValues = (employee) => ({
  tanggal: new Date().toISOString().split('T')[0],
  kategori: '',
  cabang_id: employee?.cabang?.id?.toString() || '',
  cabang_nama: employee?.cabang?.nama || '',
  cabang: employee?.cabang || null,
  penyewa_id: '',
  penyewa_nama: '',
  penyewa: null,
  equipment_id: '',
  equipment_nama: '',
  equipment_kategori: '',
  equipment: null,
  shift_id: '',
  shift_nama: '',
  shift: null,
  overtime: 'ls0',
  longshift_id: 0,
  longshift_nama: '',
  karyawan_id: employee?.id?.toString() || '',
  karyawan: employee || null,
  operator_id: employee?.id?.toString() || '',
  operator_nama: employee?.nama || '',
  activity: '',
  smustart: 0,
  smufinish: 0,
  usedsmu: 0,
  bbm: 0,
  equipment_tool: 'Bucket',
  keterangan: '',
  photo: '',
  foto: [],
  kegiatan: [
    {
      id: Date.now().toString(),
      kegiatan_id: '',
      kegiatan_nama: '',
      material_id: '',
      material_nama: '',
      lokasi_asal_id: '',
      lokasi_asal_nama: '',
      lokasi_tujuan_id: '',
      lokasi_tujuan_nama: '',
      starttime: '',
      endtime: '',
      smustart: 0,
      smufinish: 0,
      ritase: 0,
      seq: 1,
    }
  ],
});