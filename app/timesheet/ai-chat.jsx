import AppHeader from "@/src/components/AppHeader";
import AppScreen from "@/src/components/AppScreen";
import appmode from "@/src/helpers/ThemesMode";
import { getEquipment } from "@/src/redux/equipmentSlice";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { getKegiatan } from "@/src/redux/kegiatanSlice";
import { getLokasi } from "@/src/redux/lokasiSlice";
import { getLongshift } from "@/src/redux/longshiftSlice";
import { getMaterial } from "@/src/redux/materialSlice";
import { getPenyewa } from "@/src/redux/penyewaSlice";
import { getShift } from "@/src/redux/shiftSlice";
import { initTimesheet, setTimesheet, submitTimesheet } from "@/src/redux/timesheetItemSlice";
import { Ionicons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as ImagePicker from 'expo-image-picker';
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { ActionSheetIOS, Alert, Animated, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { timesheetValidationSchema } from "./validation";

const ConversationStep = {
  GREETING: 'greeting',
  DATE_INPUT: 'date_input',
  KATEGORI_INPUT: 'kategori_input',
  PENYEWA_INPUT: 'penyewa_input',
  EQUIPMENT_INPUT: 'equipment_input',
  SHIFT_INPUT: 'shift_input',
  LONGSHIFT_INPUT: 'longshift_input',
  SMU_INPUT: 'smu_input',
  BBM_INPUT: 'bbm_input',
  KEGIATAN_LOOP: 'kegiatan_loop',
  KEGIATAN_JENIS: 'kegiatan_jenis',
  KEGIATAN_MATERIAL: 'kegiatan_material',
  KEGIATAN_LOKASI_ASAL: 'kegiatan_lokasi_asal',
  KEGIATAN_LOKASI_TUJUAN: 'kegiatan_lokasi_tujuan',
  KEGIATAN_HARI: 'kegiatan_hari',
  KEGIATAN_WAKTU: 'kegiatan_waktu',
  KEGIATAN_HM: 'kegiatan_hm',
  KEGIATAN_RITASE: 'kegiatan_ritase',
  KEGIATAN_ADD_MORE: 'kegiatan_add_more',
  KETERANGAN_INPUT: 'keterangan_input',
  FOTO_INPUT: 'foto_input',
  CONFIRMATION: 'confirmation',
  COMPLETED: 'completed'
};

export default function ChatAi(){
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  const dispatch = useAppDispatch();
  
  const { employee, user } = useAppSelector(state => state.auth);
  const shiftData = useAppSelector(state => state.shift?.data || []);
  const equipmentData = useAppSelector(state => state.equipment?.data || []);
  const kegiatanData = useAppSelector(state => state.kegiatan?.data || []);
  const penyewaData = useAppSelector(state => state.penyewa?.data || []);
  const longshiftData = useAppSelector(state => state.longshift?.data || []);
  const materialData = useAppSelector(state => state.material?.data || []);
  const lokasiData = useAppSelector(state => state.lokasi?.data || []);
  
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { 
      id: "m1", 
      role: "assistant", 
      text: "Halo "+employee?.nama+"! 👋 Saya Athi, asisten ceria untuk input timesheet kamu. Yuk kita mulai! Mau input untuk tanggal berapa nih?\n\n💡 Contoh format:\n• \"hari ini\"\n• \"21 Okt 2025\"\n• \"21 Oktober 2025\"\n• \"21/10/2025\"", 
      createdAt: Date.now() - 60000 
    },
  ]);
  const [sending, setSending] = useState(false);
  const [currentStep, setCurrentStep] = useState(ConversationStep.DATE_INPUT);
  const [collectedData, setCollectedData] = useState({});
  const [quickReplies, setQuickReplies] = useState(null);
  const [useAI, setUseAI] = useState(true);
  const [aiInitialized, setAiInitialized] = useState(false);
  const [currentKegiatanIndex, setCurrentKegiatanIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [penyewaList, setPenyewaList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [kegiatanList, setKegiatanList] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [lokasiAsalList, setLokasiAsalList] = useState([]);
  const [lokasiTujuanList, setLokasiTujuanList] = useState([]);
  const [hariOptions, setHariOptions] = useState([]);
  const [messageCounter, setMessageCounter] = useState(0);
  const listRef = useRef(null);
  const modelRef = useRef(null);
  const chatRef = useRef(null);
  const loadingAnimation = useRef(new Animated.Value(0)).current;

  // Generate unique ID for messages
  const generateUniqueId = (prefix = '') => {
    const counter = messageCounter + 1;
    setMessageCounter(counter);
    return `${prefix}${Date.now()}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate hari options (hari ops & besok)
  const generateHariOptions = () => {
    // Gunakan tanggal operational yang dipilih di awal
    const dateOps = collectedData.tanggal ? new Date(collectedData.tanggal) : new Date();
    const tomorrow = new Date(dateOps);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const hariOps = {
      label: `${formatHari(dateOps)}, ${dateOps.getDate()} ${formatBulan(dateOps)} ${dateOps.getFullYear()} (Tanggal Ops)`,
      value: dateOps.toISOString().slice(0, 10), // YYYY-MM-DD
      displayDate: formatHari(dateOps) + ', ' + dateOps.getDate() + ' ' + formatBulan(dateOps) + ' ' + dateOps.getFullYear()
    };
    
    const besok = {
      label: `Besok (${formatHari(tomorrow)}, ${tomorrow.getDate()} ${formatBulan(tomorrow)} ${tomorrow.getFullYear()})`,
      value: tomorrow.toISOString().slice(0, 10), // YYYY-MM-DD
      displayDate: formatHari(tomorrow) + ', ' + tomorrow.getDate() + ' ' + formatBulan(tomorrow) + ' ' + tomorrow.getFullYear()
    };
    
    return [hariOps, besok];
  };

  // Format hari dalam bahasa Indonesia menggunakan moment
  const formatHari = (date) => {
    return moment(date).locale('id').format('dddd');
  };

  // Format bulan dalam bahasa Indonesia menggunakan moment
  const formatBulan = (date) => {
    return moment(date).locale('id').format('MMM');
  };

  // Filter equipment based on user type
  const getFilteredEquipment = () => {
    const userType = user?.usertype || employee?.usertype || '';
    console.log("👤 User type detected:", userType);
    
    let filtered;
    if (userType.toLowerCase() === 'driver') {
      filtered = equipmentData.filter(e => e.kategori === 'DT');
      console.log("🚚 Driver equipment (DT):", filtered.length, "items");
    } else if (userType.toLowerCase() === 'operator') {
      filtered = equipmentData.filter(e => e.kategori === 'HE');
      console.log("🏗️ Operator equipment (HE):", filtered.length, "items");
    } else {
      filtered = equipmentData;
      console.log("👥 Default user - showing all equipment:", filtered.length, "items");
    }
    
    // Limit to maximum 10 items
    const limited = filtered.slice(0, 10);
    console.log("📋 Showing limited equipment:", limited.length, "items");
    return limited;
  };

  // Filter kegiatan based on equipment kategori
  const getFilteredKegiatan = (equipmentKategori) => {
    console.log("🔍 Filtering kegiatan for equipment kategori:", equipmentKategori);
    
    const filtered = kegiatanData.filter(k => k.grpequipment === equipmentKategori);
    console.log(`📋 Kegiatan for ${equipmentKategori}:`, filtered.length, "items");
    
    // Limit to maximum 10 items
    const limited = filtered.slice(0, 10);
    console.log("📋 Showing limited kegiatan:", limited.length, "items");
    return limited;
  };

  // Filter lokasi based on user cabang
  const getFilteredLokasi = () => {
    console.log("🔍 Filtering lokasi for user cabang:", employee?.cabang?.id);
    
    const userCabangId = employee?.cabang?.id?.toString();
    if (!userCabangId) {
      console.log("⚠️ No user cabang found, showing all lokasi");
      return lokasiData.slice(0, 10);
    }
    
    const filtered = lokasiData.filter(l => l.cabang_id?.toString() === userCabangId);
    console.log(`📋 Lokasi for cabang ${userCabangId}:`, filtered.length, "items");
    
    // Limit to maximum 10 items
    const limited = filtered.slice(0, 10);
    console.log("📋 Showing limited lokasi:", limited.length, "items");
    return limited;
  };

  useEffect(() => {
    dispatch(getShift());
    dispatch(getEquipment());
    dispatch(getKegiatan());
    dispatch(getPenyewa());
    dispatch(getLongshift());
    dispatch(getMaterial());
    dispatch(getLokasi());
    
    // Request camera and media library permissions on mount
    (async () => {
      try {
        await requestCameraPermission();
        await requestMediaLibraryPermission();
      } catch (error) {
        console.log('Permission request failed:', error);
      }
    })();
  }, []);

  // Initialize with employee data
  useEffect(() => {
    if (employee?.id) {
      const initialData = {
        tanggal: new Date().toISOString().split('T')[0],
        kategori: '',
        cabang_id: employee.cabang?.id?.toString() || '',
        cabang_nama: employee.cabang?.nama || '',
        cabang: employee.cabang || null,
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
        karyawan_id: employee.id?.toString() || '',
        karyawan: employee || null,
        operator_id: employee.id?.toString() || '',
        operator_nama: employee.nama || '',
        activity: '',
        smustart: 0,
        smufinish: 0,
        usedsmu: 0,
        bbm: 0,
        equipment_tool: 'Bucket',
        keterangan: '',
        photo: '',
        foto: [],
        kegiatan: [{
          id: generateUniqueId('kegiatan-'),
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
        }]
      };
      setCollectedData(initialData);
      dispatch(initTimesheet());
      dispatch(setTimesheet(initialData));
    }
  }, [employee, dispatch]);

  useEffect(() => {
    const initGemini = async () => {
      try {
        const apiKey = "AIzaSyDfxfVWPtwbai8Olg9a-KPhmg3EfU6d1O4";
        if (!apiKey) {
          throw new Error("API key is missing");
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        modelRef.current = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        });
        
        // Test the model with a simple prompt
        const testResult = await modelRef.current.generateContent("Test");
        const testResponse = await testResult.response;
        console.log("✅ Gemini 2.5 Flash initialized successfully");
        console.log("🧪 Test response:", testResponse.text().substring(0, 50) + "...");
        setAiInitialized(true);
        
      } catch (e) {
        console.log("❌ Failed to init Gemini:", e.message);
        console.warn("⚠️ AI features will be disabled, using fallback responses");
        modelRef.current = null;
        setAiInitialized(false);
      }
    };
    initGemini();
  }, []);

  console.log("COLLECTION-DATA", collectedData);
  

  const parseDateInput = (text) => {
    const input = text.trim().toLowerCase();
    
    // Handle "hari ini" atau "today"
    if (input.includes('hari ini') || input.includes('today')) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Handle DD MMM YYYY (contoh: 21 Okt 2025, 21 Oktober 2025)
    const dateRegex1 = /^(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)\s+(\d{4})$/i;
    const dateRegex2 = /^(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(\d{4})$/i;
    
    let match;
    
    // Coba format singkat (Okt, Nov, dll)
    if ((match = input.match(dateRegex1))) {
      const [, day, month, year] = match;
      const monthMap = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mei': '05', 'jun': '06',
        'jul': '07', 'agu': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'des': '12'
      };
      
      const dayNum = day.padStart(2, '0');
      const monthNum = monthMap[month.toLowerCase()];
      const yearNum = year;
      
      const formattedDate = `${yearNum}-${monthNum}-${dayNum}`;
      
      // Validasi tanggal
      const date = new Date(formattedDate);
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return formattedDate;
    }
    
    // Coba format panjang (Oktober, November, dll)
    if ((match = input.match(dateRegex2))) {
      const [, day, month, year] = match;
      const monthMap = {
        'januari': '01', 'februari': '02', 'maret': '03', 'april': '04', 'mei': '05', 'juni': '06',
        'juli': '07', 'agustus': '08', 'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
      };
      
      const dayNum = day.padStart(2, '0');
      const monthNum = monthMap[month.toLowerCase()];
      const yearNum = year;
      
      const formattedDate = `${yearNum}-${monthNum}-${dayNum}`;
      
      // Validasi tanggal
      const date = new Date(formattedDate);
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return formattedDate;
    }
    
    // Handle format YYYY-MM-DD
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoRegex.test(input)) {
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        return null;
      }
      return input;
    }
    
    // Handle format DD/MM/YYYY atau DD-MM-YYYY (European format)
    const dmyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    if ((match = input.match(dmyRegex))) {
      const [, day, month, year] = match;
      const dayNum = day.padStart(2, '0');
      const monthNum = month.padStart(2, '0');
      const yearNum = year;
      
      const formattedDate = `${yearNum}-${monthNum}-${dayNum}`;
      
      // Validasi tanggal
      const date = new Date(formattedDate);
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return formattedDate;
    }
    
    return null;
  };

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  // Show photo options (Camera or Gallery)
  const showPhotoOptions = () => {
    const options = ['📷 Ambil Foto', '🖼️ Pilih dari Galeri', '❌ Batal'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          userInterfaceStyle: isDark ? 'dark' : 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            takePhoto();
          } else if (buttonIndex === 1) {
            pickImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Upload Foto',
        'Pilih sumber foto:',
        [
          { text: '📷 Ambil Foto', onPress: takePhoto },
          { text: '🖼️ Pilih dari Galeri', onPress: pickImage },
          { text: '❌ Batal', style: 'cancel' },
        ]
      );
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Error', 'Izin kamera diperlukan untuk mengambil foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = result.assets[0];
        const updatedPhotos = [...uploadedPhotos, newPhoto];
        setUploadedPhotos(updatedPhotos);
        
        // Update collectedData with photo info
        setCollectedData(prev => ({
          ...prev,
          foto: updatedPhotos,
          photo: newPhoto.uri
        }));

        // Add message about photo upload
        const photoMsg = {
          id: generateUniqueId('photo-'),
          role: "user",
          text: `📷 Foto ditambahkan: ${newPhoto.fileName || 'Timesheet Photo'}`,
          createdAt: Date.now(),
          isPhoto: true,
          photoUri: newPhoto.uri
        };
        setMessages(prev => [...prev, photoMsg]);

        // Auto-respond with confirmation
        setTimeout(() => {
          const botMsg = {
            id: generateUniqueId('a-'),
            role: "assistant",
            text: `✅ Foto berhasil ditambahkan! Ada foto lagi yang mau ditambahkan? (ketik "selesai" jika sudah)`,
            createdAt: Date.now()
          };
          setMessages(prev => [...prev, botMsg]);
        }, 500);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Gagal mengambil foto. Silakan coba lagi.');
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        Alert.alert('Error', 'Izin galeri diperlukan untuk memilih foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = result.assets[0];
        const updatedPhotos = [...uploadedPhotos, newPhoto];
        setUploadedPhotos(updatedPhotos);
        
        // Update collectedData with photo info
        setCollectedData(prev => ({
          ...prev,
          foto: updatedPhotos,
          photo: newPhoto.uri
        }));

        // Add message about photo upload
        const photoMsg = {
          id: generateUniqueId('photo-'),
          role: "user",
          text: `🖼️ Foto ditambahkan: ${newPhoto.fileName || 'Timesheet Photo'}`,
          createdAt: Date.now(),
          isPhoto: true,
          photoUri: newPhoto.uri
        };
        setMessages(prev => [...prev, photoMsg]);

        // Auto-respond with confirmation
        setTimeout(() => {
          const botMsg = {
            id: generateUniqueId('a-'),
            role: "assistant",
            text: `✅ Foto berhasil ditambahkan! Ada foto lagi yang mau ditambahkan? (ketik "selesai" jika sudah)`,
            createdAt: Date.now()
          };
          setMessages(prev => [...prev, botMsg]);
        }, 500);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih foto. Silakan coba lagi.');
    }
  };

  // Remove photo
  const removePhoto = (indexToRemove) => {
    const updatedPhotos = uploadedPhotos.filter((_, index) => index !== indexToRemove);
    setUploadedPhotos(updatedPhotos);
    
    setCollectedData(prev => ({
      ...prev,
      foto: updatedPhotos,
      photo: updatedPhotos.length > 0 ? updatedPhotos[updatedPhotos.length - 1].uri : ''
    }));
  };

  const detectConversationType = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Deteksi candaan/godaan
    const playfulPatterns = [
      'cantik', 'sayang', 'say', 'babe', 'honey', 'love', 'sweetheart',
      'ganteng', 'cakep', 'tampan', 'adorable', 'cute', 'imut',
      'pacar', 'jadian', 'kencan', 'dating', 'relationship',
      'miss u', 'kangen', 'rindu', 'sayangku',
      '😍', '❤️', '💕', '💖', '💗', '😘', '🥰', '😊'
    ];
    
    // Deteksi candaan/lelucon
    const jokePatterns = [
      'lucu', 'funny', 'haha', 'hehe', 'wkwk', 'lol', 'lmao',
      'guyon', 'canda', 'bercanda', 'lelucon', 'ketawa',
      'ngakak', 'ketawa ngakak', 'sampe kencing', 'sampe mules',
      '😂', '🤣', '😆', '😄', '😁'
    ];
    
    // Deteksi keluhan/marah
    const complaintPatterns = [
      'benci', 'marah', 'kesal', 'sebel', 'jengkel', 'dongkol',
      'payah', 'jelek', 'buruk', 'gagal', 'error', 'bug',
      'tolol', 'bodoh', 'goblok', 'stupid', 'dumb'
    ];
    
    // Deteksi pertanyaan umum di luar konteks
    const generalQuestionPatterns = [
      'apa kabar', 'how are you', 'siapa kamu', 'who are you',
      'umur', 'age', 'asal', 'dari mana', 'hobi', 'hobby',
      'cuaca', 'weather', 'hari ini', 'today'
    ];
    
    if (playfulPatterns.some(pattern => message.includes(pattern))) {
      return 'playful';
    } else if (jokePatterns.some(pattern => message.includes(pattern))) {
      return 'joke';
    } else if (complaintPatterns.some(pattern => message.includes(pattern))) {
      return 'complaint';
    } else if (generalQuestionPatterns.some(pattern => message.includes(pattern))) {
      return 'general';
    }
    
    return 'normal';
  };

  const getPlayfulResponse = (message, currentStep) => {
    const stepResponses = {
      [ConversationStep.DATE_INPUT]: "Aduh kamu ini, mau goda Athi dulu ya sebelum kerja? 😊 Oke deh, kali ini aja ya. Tanggal berapa mau input timesheetnya?",
      [ConversationStep.KATEGORI_INPUT]: "Hai handsome! 🥰 Jangan diganggu kerjanya dong, fokus dulu sama kategorinya. Barging, Mining, atau Rental?",
      [ConversationStep.PENYEWA_INPUT]: "Ehmm, kamu ini bikin Athi baper! 😊 Cepat selesaikan timesheetnya dulu, siapa nama penyewanya?",
      [ConversationStep.EQUIPMENT_INPUT]: "Sayanggg, Athi mau fokus bantu kerja kamu dulu ya. Equipment apa yang digunakan?",
      [ConversationStep.SHIFT_INPUT]: "Kamu ini bikin Athi malu! 😊 Shift apa yang dipilih biar cepat selesai?",
      default: "Hehe kamu ini lucu deh! 😊 Tapi kita fokus dulu ya biar cepat selesai kerjanya."
    };
    
    return stepResponses[currentStep] || stepResponses.default;
  };

  const getJokeResponse = (message, currentStep) => {
    const stepResponses = {
      [ConversationStep.DATE_INPUT]: "Haha lucu kamu! 😂 Tapi timesheetnya harus diisi dong. Tanggal berapa?",
      [ConversationStep.KATEGORI_INPUT]: "Wkwk kamu ini bikin Athi ngakak! 😂 Oke deh, kategori apa? Barging, Mining, atau Rental?",
      [ConversationStep.PENYEWA_INPUT]: "Hahaha ketawa ngakak! 😂 Tapi kerjaan harus selesai. Siapa penyewanya?",
      [ConversationStep.EQUIPMENT_INPUT]: "LOL! Kamu ini komedian ya? 😂 Equipment apa yang dipilih?",
      [ConversationStep.SHIFT_INPUT]: "Hahaha lucu banget! 😂 Shift apa biar kita lanjut?",
      default: "Hahaha kamu ini memang lucu! 😂 Tapi kita harus fokus ya, lanjut ke step berikutnya."
    };
    
    return stepResponses[currentStep] || stepResponses.default;
  };

  const getComplaintResponse = (message, currentStep) => {
    return "Maaf ya kalau Athi ada kurangnya 😔 Athi masih belajar. Mari kita fokus selesaikan timesheetnya dulu ya. ";
  };

  const getGeneralResponse = (message, currentStep) => {
    const responses = {
      'apa kabar': "Athi baik-baik saja, terima kasih! 😊 Kembali ke timesheet ya, ",
      'siapa kamu': "Athi adalah asisten digital untuk input timesheet. Yuk kita lanjut kerjanya! ",
      'umur': "Athi masih muda banget, masih belajar! 😊 Fokus ke timesheet dulu ya, ",
      'cuaca': "Hmm Athi ga bisa lihat cuaca, tapi Athi bisa bantu input timesheet! ",
      default: "Menarik! Tapi Athi harus fokus bantu kerja kamu dulu ya. "
    };
    
    for (const [key, response] of Object.entries(responses)) {
      if (message.toLowerCase().includes(key)) {
        return response;
      }
    }
    
    return responses.default;
  };

  const buildSystemPrompt = () => {
    const stepInfo = {
      [ConversationStep.DATE_INPUT]: "Step 1: Tanya tanggal operational (default: hari ini)",
      [ConversationStep.KATEGORI_INPUT]: "Step 2: Tanya kategori pekerjaan (barging/mining/rental)",
      [ConversationStep.PENYEWA_INPUT]: "Step 3: Tanya nama penyewa",
      [ConversationStep.EQUIPMENT_INPUT]: "Step 4: Tanya equipment yang digunakan",
      [ConversationStep.SHIFT_INPUT]: "Step 5: Tanya shift kerja",
      [ConversationStep.LONGSHIFT_INPUT]: "Step 6: Tanya longshift (opsional)",
      [ConversationStep.SMU_INPUT]: "Step 7: Tanya HM/KM Start dan Finish",
      [ConversationStep.BBM_INPUT]: "Step 8: Tanya refuel BBM (liter)",
      [ConversationStep.KEGIATAN_LOOP]: "Step 9: Mulai input kegiatan",
      [ConversationStep.KEGIATAN_JENIS]: "Step 10a: Tanya jenis kegiatan",
      [ConversationStep.KEGIATAN_MATERIAL]: "Step 10b: Tanya material (opsional)",
      [ConversationStep.KEGIATAN_LOKASI_ASAL]: "Step 10c: Tanya lokasi asal",
      [ConversationStep.KEGIATAN_LOKASI_TUJUAN]: "Step 10d: Tanya lokasi tujuan (opsional)",
      [ConversationStep.KEGIATAN_HARI]: "Step 10e: Tanya pemilihan hari",
      [ConversationStep.KEGIATAN_WAKTU]: "Step 10f: Tanya waktu mulai dan selesai",
      [ConversationStep.KEGIATAN_HM]: "Step 10g: Tanya HM/KM per kegiatan (opsional)",
      [ConversationStep.KEGIATAN_RITASE]: "Step 10h: Tanya jumlah ritase",
      [ConversationStep.KEGIATAN_ADD_MORE]: "Step 10i: Tanya apakah ada kegiatan lain",
      [ConversationStep.KETERANGAN_INPUT]: "Step 11: Tanya keterangan (opsional)",
      [ConversationStep.FOTO_INPUT]: "Step 12: Tanya foto (opsional)",
      [ConversationStep.CONFIRMATION]: "Step 13: Tampilkan ringkasan dan minta konfirmasi"
    };

    const context = `Kamu adalah Athi, asisten digital yang ramah, ceria, dan sedikit playful untuk input timesheet operator alat berat.

    PERSONALITY ATHI:
    - Nama: Athi (singkatan dari "AI Timesheet Helper")
    - Usia: 23 tahun (dalam cerita)
    - Sifat: Ceria, helpful, sedikit flirty tapi tetap profesional
    - Cara bicara: Natural seperti teman, pakai emoji yang sesuai
    - Selalu bersemangat membantu user
    
    ATURAN INTERAKSI:
    - Jawab SINGKAT dan NATURAL (max 2 kalimat)
    - Gunakan Bahasa Indonesia yang santai seperti teman ngobrol
    - Boleh pakai emoji yang sesuai dengan suasana
    - Jika user canda/goda, balas dengan playful tapi tetap arahkan ke konteks
    - Jika user marah/keluh, balas dengan empati dan tenangkan
    - Jika user tanya hal umum, jawab singkat lalu arahkan kembali
    - Fokus pada step saat ini tapi dengan cara yang fun
    - JANGAN PERNAH validasi data master - sistem sudah handle
    - Selalu berikan respons positif dan encouraging
    
    CONTOH RESPONS PLAYFUL:
    - User: "Athi kamu cantik deh" → "Aduh kamu ini bikin Athi malu! 😊 Tanggal berapa mau input timesheetnya?"
    - User: "Haha lucu kamu" → "Haha kamu juga lucu! 😂 Equipment apa yang digunakan?"
    - User: "Athi marah nih" → "Oh no, maaf ya kalau ada salah 😔 Mari kita selesaikan bersama ya"
    
    CURRENT STEP: ${stepInfo[currentStep] || currentStep}

    DATA TERKUMPUL:
    ${Object.keys(collectedData).length > 0 ? JSON.stringify(collectedData, null, 2) : "Belum ada"}

    MASTER DATA (untuk referensi saja, jangan validasi):
    - Total Shift: ${shiftData.length} item
    - Total Equipment: ${equipmentData.length} item  
    - Total Kegiatan: ${kegiatanData.length} item
    - Total Penyewa: ${penyewaData.length} item
    - Total Longshift: ${longshiftData.length} item

    GUIDELINES:
    1. Selalu balas dengan cara yang friendly dan encouraging
    2. Jika user menyimpang, arahkan kembali dengan cara yang fun
    3. Bantu user dengan ramah dan efisien
    4. Jangan lupa parsing data sesuai kebutuhan endpoint api
    5. Jadikan proses input timesheet menyenangkan!`;

    return context;
  };

  const askGemini = async (userMessage) => {
    try {
      if (!modelRef.current) {
        console.warn("Gemini model not initialized, using fallback");
        throw new Error("Gemini model not initialized");
      }

      const systemPrompt = buildSystemPrompt();
      const prompt = `${systemPrompt}\n\nUser: ${userMessage}\nAthi:`;

      console.log("🤖 Sending to Gemini:", prompt.substring(0, 200) + "...");
      
      const result = await modelRef.current.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const trimmedText = text.trim();
      console.log("🤖 Gemini response:", trimmedText.substring(0, 100) + "...");
      
      if (!trimmedText || trimmedText.length === 0) {
        console.warn("Gemini returned empty response");
        throw new Error("Empty response from Gemini");
      }
      
      return trimmedText;
    } catch (error) {
      console.log("❌ Gemini API error:", error.message);
      throw error;
    }
  };

  const handleQuickReply = (value) => {
    setInput(value);
    setTimeout(() => onSend(value), 100);
  };

  const handleRepeatCommand = (text) => {
    const repeatCommands = {
      'ulangi tanggal': ConversationStep.DATE_INPUT,
      'ulangi kategori': ConversationStep.KATEGORI_INPUT,
      'ulangi penyewa': ConversationStep.PENYEWA_INPUT,
      'ulangi equipment': ConversationStep.EQUIPMENT_INPUT,
      'ulangi shift': ConversationStep.SHIFT_INPUT,
      'ulangi longshift': ConversationStep.LONGSHIFT_INPUT,
      'ulangi smu': ConversationStep.SMU_INPUT,
      'ulangi hm': ConversationStep.SMU_INPUT,
      'ulangi bbm': ConversationStep.BBM_INPUT,
      'ulangi fuel': ConversationStep.BBM_INPUT,
      'ulangi bahan bakar': ConversationStep.BBM_INPUT,
      'ulangi kegiatan': ConversationStep.KEGIATAN_JENIS,
      'ulangi material': ConversationStep.KEGIATAN_MATERIAL,
      'ulangi lokasi asal': ConversationStep.KEGIATAN_LOKASI_ASAL,
      'ulangi lokasi tujuan': ConversationStep.KEGIATAN_LOKASI_TUJUAN,
      'ulangi waktu': ConversationStep.KEGIATAN_WAKTU,
      'ulangi jam': ConversationStep.KEGIATAN_WAKTU,
      'ulangi hm kegiatan': ConversationStep.KEGIATAN_HM,
      'ulangi ritase': ConversationStep.KEGIATAN_RITASE,
      'ulangi keterangan': ConversationStep.KETERANGAN_INPUT,
      'ulangi foto': ConversationStep.FOTO_INPUT,
    };

    const lowerText = text.toLowerCase();
    for (const [command, step] of Object.entries(repeatCommands)) {
      if (lowerText.includes(command)) {
        return step;
      }
    }
    return null;
  };

  const getRepeatResponse = (step) => {
    const responses = {
      [ConversationStep.DATE_INPUT]: 'Oke, ulangi input tanggal ya! Tanggal berapa? (ketik "hari ini" atau tanggal lengkap)',
      [ConversationStep.KATEGORI_INPUT]: 'Siap, ulangi kategori! Pilih lagi: Barging, Mining, atau Rental?',
      [ConversationStep.PENYEWA_INPUT]: () => {
        // Return special object to indicate penyewa list
        return {
          text: `Oke, ulangi nama penyewa! 📋\n\n💡 Pilih dari daftar penyewa di bawah:`,
          hasPenyewaList: true,
          penyewaList: penyewaData
        };
      },
      [ConversationStep.EQUIPMENT_INPUT]: 'Siap, ulangi equipment! Equipment apa yang digunakan?',
      [ConversationStep.SHIFT_INPUT]: 'Oke, ulangi shift! Shift apa yang dipilih?',
      [ConversationStep.LONGSHIFT_INPUT]: 'Siap, ulangi longshift! Ada longshift? (ketik - jika tidak ada)',
      [ConversationStep.SMU_INPUT]: 'Oke, ulangi HM/KM! HM/KM Start berapa?',
      [ConversationStep.BBM_INPUT]: 'Siap, ulangi BBM! Refuel BBM berapa liter?',
      [ConversationStep.KEGIATAN_JENIS]: () => {
        // Get equipment kategori for filtering
        const equipmentKategori = collectedData.equipment_kategori || collectedData.equipment?.kategori;
        const filteredKegiatan = getFilteredKegiatan(equipmentKategori);
        
        return {
          text: `Siap, ulangi jenis kegiatan! 📋\n\n💡 Pilih dari daftar kegiatan ${equipmentKategori} di bawah:\n\nKamu juga bisa langsung mengetik nama kegiatannya kok, Athi juga bisa faham sayang... 😊`,
          hasKegiatanList: true,
          kegiatanList: filteredKegiatan
        };
      },
      [ConversationStep.KEGIATAN_MATERIAL]: () => {
        const materialListWithOptions = [
          { id: 'no-material', nama: '-' },
          ...materialData
        ];
        
        return {
          text: `Oke, ulangi material! 📋\n\n💡 Pilih dari daftar material di bawah:\n\nKamu juga bisa langsung mengetik nama materialnya kok, Athi juga bisa faham sayang... 😊`,
          hasMaterialList: true,
          materialList: materialListWithOptions
        };
      },
      [ConversationStep.KEGIATAN_LOKASI_ASAL]: () => {
        const lokasiAsalListWithOptions = [
          { id: 'no-lokasi-asal', nama: '-' },
          ...getFilteredLokasi()
        ];
        
        return {
          text: `Siap, ulangi lokasi asal! 📋\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`,
          hasLokasiAsalList: true,
          lokasiAsalList: lokasiAsalListWithOptions
        };
      },
      [ConversationStep.KEGIATAN_LOKASI_TUJUAN]: () => {
        const lokasiTujuanListWithOptions = [
          { id: 'no-lokasi-tujuan', nama: '-' },
          ...getFilteredLokasi()
        ];
        
        return {
          text: `Oke, ulangi lokasi tujuan! 📋\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`,
          hasLokasiTujuanList: true,
          lokasiTujuanList: lokasiTujuanListWithOptions
        };
      },
      [ConversationStep.KEGIATAN_WAKTU]: 'Siap, ulangi waktu! Waktu mulai jam berapa?',
      [ConversationStep.KEGIATAN_HM]: 'Oke, ulangi HM/KM per kegiatan! HM/KM Start per kegiatan?',
      [ConversationStep.KEGIATAN_RITASE]: 'Siap, ulangi ritase! Jumlah ritase berapa?',
      [ConversationStep.KETERANGAN_INPUT]: 'Oke, ulangi keterangan! Ada keterangan tambahan?',
      [ConversationStep.FOTO_INPUT]: 'Oke, ulangi foto! Ada foto yang mau dilampirkan?',
    };
    return responses[step] || 'Oke, ulangi input data!';
  };

  const getRepeatQuickReplies = (step) => {
    const quickReplies = {
      [ConversationStep.KATEGORI_INPUT]: [
        { label: 'Barging', value: 'barging' },
        { label: 'Mining', value: 'mining' },
        { label: 'Rental', value: 'rental' }
      ],
      [ConversationStep.LONGSHIFT_INPUT]: [
        { label: '-', value: '-' },
        ...longshiftData.map(l => ({ label: l.nama, value: l.nama }))
      ],
      [ConversationStep.SHIFT_INPUT]: shiftData.map(s => ({ label: s.nama, value: s.nama })),
      [ConversationStep.EQUIPMENT_INPUT]: [], // Equipment menggunakan interactive list
      [ConversationStep.PENYEWA_INPUT]: [], // Penyewa menggunakan interactive list
      [ConversationStep.KEGIATAN_JENIS]: [], // Kegiatan menggunakan interactive list
    };
    return quickReplies[step] || null;
  };

  const getStepQuestion = (step) => {
    const questions = {
      [ConversationStep.DATE_INPUT]: "Tanggal berapa mau input timesheetnya?",
      [ConversationStep.KATEGORI_INPUT]: "Kategori pekerjaan apa? Barging, Mining, atau Rental?",
      [ConversationStep.PENYEWA_INPUT]: "",
      [ConversationStep.EQUIPMENT_INPUT]: "Equipment apa yang digunakan?",
      [ConversationStep.SHIFT_INPUT]: "Shift apa yang dipilih?",
      [ConversationStep.LONGSHIFT_INPUT]: "Ada longshift? (ketik - jika tidak ada)",
      [ConversationStep.SMU_INPUT]: "HM/KM Start berapa?",
      [ConversationStep.BBM_INPUT]: "Refuel BBM berapa liter?",
      [ConversationStep.KEGIATAN_JENIS]: "Jenis kegiatan apa?",
      [ConversationStep.KEGIATAN_MATERIAL]: "Material apa? (ketik - jika tidak ada)",
      [ConversationStep.KEGIATAN_LOKASI_ASAL]: "Lokasi asal di mana?",
      [ConversationStep.KEGIATAN_LOKASI_TUJUAN]: "Lokasi tujuan di mana? (ketik - jika tidak ada)",
      [ConversationStep.KEGIATAN_HARI]: "Pilih tanggal untuk kegiatan:",
      [ConversationStep.KEGIATAN_WAKTU]: "Waktu mulai jam berapa?",
      [ConversationStep.KEGIATAN_HM]: "HM/KM per kegiatan berapa?",
      [ConversationStep.KEGIATAN_RITASE]: "Jumlah ritase berapa?",
      [ConversationStep.KETERANGAN_INPUT]: "Ada keterangan tambahan?",
      [ConversationStep.FOTO_INPUT]: "Ada foto yang mau dilampirkan?",
    };
    return questions[step] || "Lanjut ke langkah berikutnya?";
  };

  const getStepQuickReplies = (step) => {
    const quickReplies = {
      [ConversationStep.KATEGORI_INPUT]: [
        { label: 'Barging', value: 'barging' },
        { label: 'Mining', value: 'mining' },
        { label: 'Rental', value: 'rental' }
      ],
      [ConversationStep.LONGSHIFT_INPUT]: [
        { label: '-', value: '-' },
        ...longshiftData.map(l => ({ label: l.nama, value: l.nama }))
      ],
      [ConversationStep.SHIFT_INPUT]: shiftData.map(s => ({ label: s.nama, value: s.nama })),
      [ConversationStep.EQUIPMENT_INPUT]: [], // Equipment menggunakan interactive list
      [ConversationStep.PENYEWA_INPUT]: [], // Penyewa menggunakan interactive list
      [ConversationStep.KEGIATAN_MATERIAL]: [], // Material menggunakan interactive list
      [ConversationStep.KEGIATAN_LOKASI_ASAL]: [], // Lokasi Asal menggunakan interactive list
      [ConversationStep.KEGIATAN_LOKASI_TUJUAN]: [], // Lokasi Tujuan menggunakan interactive list
      [ConversationStep.KEGIATAN_HARI]: generateHariOptions().map(h => ({ label: h.label, value: h.value })), // Hari options
    };
    return quickReplies[step] || null;
  };

  const validateField = async (field, value) => {
    try {
      const schema = timesheetValidationSchema;
      const testObject = { ...collectedData, [field]: value };
      await schema.validateAt(field, testObject);
      return null;
    } catch (error) {
      return error.message;
    }
  };

  const handlePenyewaClick = async (penyewa) => {
    // Simulate user selecting penyewa
    const userMsg = { 
      id: generateUniqueId('u-'), 
      role: "user", 
      text: penyewa.nama,
      createdAt: Date.now() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Process the selection
    await processPenyewaSelection(penyewa.nama);
  };

  const handleEquipmentClick = async (equipment) => {
    // Simulate user selecting equipment
    const userMsg = { 
      id: generateUniqueId('u-'), 
      role: "user", 
      text: `${equipment.kode} - ${equipment.nama}`,
      createdAt: Date.now() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Process the selection
    await processEquipmentSelection(equipment.kode, equipment.nama);
  };

  const processEquipmentSelection = async (equipmentKode, equipmentNama) => {
    try {
      setSending(true);
      
      const equipment = equipmentData.find(e => e.kode === equipmentKode);
      
      if (equipment) {
        setCollectedData(prev => ({ 
          ...prev, 
          equipment_id: equipment.id.toString(),
          equipment_nama: equipment.kode,
          equipment_kategori: equipment.kategori,
          equipment: equipment
        }));
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Equipment ${equipment.kode} - ${equipment.nama} dipilih. Tanya shift yang digunakan.`);
          } catch (error) {
            console.warn("AI failed for equipment, using fallback:", error.message);
            responseText = `✅ Equipment ${equipment.kode} - ${equipment.nama} dicatat. Shift apa yang digunakan?`;
          }
        } else {
          responseText = `✅ Equipment ${equipment.kode} - ${equipment.nama} dicatat. Shift apa yang digunakan?`;
        }
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText, 
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        const shiftQuickReplies = shiftData.map(s => ({ label: s.nama, value: s.nama }));
        setQuickReplies(shiftQuickReplies);
        setCurrentStep(ConversationStep.SHIFT_INPUT);
        console.log("✅ Equipment selected from click:", equipment.kode, "-", equipment.nama);
      }
    } catch (error) {
      console.log('Error processing equipment selection:', error);
      const errorMsg = { 
        id: generateUniqueId('a-'), 
        role: "assistant", 
        text: '❌ Terjadi kesalahan saat memilih equipment. Silakan coba lagi.', 
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKegiatanClick = async (kegiatan) => {
    // Simulate user selecting kegiatan
    const userMsg = { 
      id: generateUniqueId('u-'), 
      role: "user", 
      text: kegiatan.nama,
      createdAt: Date.now() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Process the selection
    await processKegiatanSelection(kegiatan.id, kegiatan.nama);
  };

  const processKegiatanSelection = async (kegiatanId, kegiatanNama) => {
    try {
      setSending(true);
      
      const kegiatan = kegiatanData.find(k => k.id === kegiatanId);
      
      if (kegiatan) {
        // Update current kegiatan in the array
        setCollectedData(prev => {
          const updatedKegiatan = [...prev.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            kegiatan_id: kegiatan.id.toString(),
            kegiatan_nama: kegiatan.nama,
            kegiatan: kegiatan
          };
          return { ...prev, kegiatan: updatedKegiatan };
        });
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Kegiatan ${kegiatan.nama} dipilih. Tanya material yang digunakan.`);
          } catch (error) {
            console.warn("AI failed for kegiatan, using fallback:", error.message);
            responseText = `✅ Kegiatan ${kegiatan.nama} dicatat. Material apa yang digunakan?`;
          }
        } else {
          responseText = `✅ Kegiatan ${kegiatan.nama} dicatat. Material apa yang digunakan?`;
        }
        
        const materialListWithOptions = [
          { id: 'no-material', nama: '-' },
          ...materialData
        ];
        
        responseText = `${responseText}\n\n💡 Pilih dari daftar material di bawah:\n\nKamu juga bisa langsung mengetik nama materialnya kok, Athi juga bisa faham sayang... 😊`;
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText,
          hasMaterialList: true,
          materialList: materialListWithOptions,
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        setQuickReplies([]);
        setCurrentStep(ConversationStep.KEGIATAN_MATERIAL);
        console.log("✅ Kegiatan selected from click:", kegiatan.nama);
      }
    } catch (error) {
      console.log('Error processing kegiatan selection:', error);
      const errorMsg = { 
        id: generateUniqueId('a-'), 
        role: "assistant", 
        text: '❌ Terjadi kesalahan saat memilih kegiatan. Silakan coba lagi.', 
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleMaterialClick = async (material) => {
    // Handle special case for "no material"
    if (material === '-' || material.nama === '-') {
      const userMsg = { 
        id: generateUniqueId('u-'), 
        role: "user", 
        text: '-',
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Process no material selection
      await processMaterialSelection('', '-');
      return;
    }
    
    // Simulate user selecting material
    const userMsg = { 
      id: generateUniqueId('u-'), 
      role: "user", 
      text: material.nama,
      createdAt: Date.now() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Process the selection
    await processMaterialSelection(material.id, material.nama);
  };

  const processMaterialSelection = async (materialId, materialNama) => {
    try {
      setSending(true);
      
      // Handle no material case
      if (materialId === '' || materialNama === '-') {
        // Update current kegiatan with no material
        setCollectedData(prev => {
          const updatedKegiatan = [...prev.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            material_id: '',
            material_nama: ''
          };
          return { ...prev, kegiatan: updatedKegiatan };
        });
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Tidak ada material. Tanya lokasi asal.`);
          } catch (error) {
            console.warn("AI failed for no material, using fallback:", error.message);
            responseText = `✅ Tidak ada material. Lokasi asal di mana?`;
          }
        } else {
          responseText = `✅ Tidak ada material. Lokasi asal di mana?`;
        }
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText, 
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        const lokasiQuickReplies = lokasiData.slice(0, 6).map(l => ({ label: l.nama, value: l.nama }));
        setQuickReplies(lokasiQuickReplies);
        setCurrentStep(ConversationStep.KEGIATAN_LOKASI_ASAL);
        console.log("✅ No material selected");
        return;
      }
      
      const material = materialData.find(m => m.id === materialId);
      
      if (material) {
        // Update current kegiatan with material
        setCollectedData(prev => {
          const updatedKegiatan = [...prev.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            material_id: material.id.toString(),
            material_nama: material.nama,
            material: material
          };
          return { ...prev, kegiatan: updatedKegiatan };
        });
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Material ${material.nama} dipilih. Tanya lokasi asal.`);
          } catch (error) {
            console.warn("AI failed for material, using fallback:", error.message);
            responseText = `✅ Material ${material.nama} dicatat. Lokasi asal di mana?`;
          }
        } else {
          responseText = `✅ Material ${material.nama} dicatat. Lokasi asal di mana?`;
        }
        
        const lokasiAsalListWithOptions = [
          { id: 'no-lokasi-asal', nama: '-' },
          ...getFilteredLokasi()
        ];
        
        responseText = `${responseText}\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`;
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText,
          hasLokasiAsalList: true,
          lokasiAsalList: lokasiAsalListWithOptions,
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        setQuickReplies([]);
        setCurrentStep(ConversationStep.KEGIATAN_LOKASI_ASAL);
        console.log("✅ Material selected from click:", material.nama);
      }
    } catch (error) {
      console.log('Error processing material selection:', error);
      const errorMsg = { 
        id: generateUniqueId('a-'), 
        role: "assistant", 
        text: '❌ Terjadi kesalahan saat memilih material. Silakan coba lagi.', 
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleLokasiAsalClick = async (lokasi) => {
    // Handle special case for "no lokasi"
    if (lokasi === '-' || lokasi.nama === '-') {
      const userMsg = { 
        id: generateUniqueId('u-'), 
        role: "user", 
        text: '-',
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Process no lokasi asal selection
      await processLokasiAsalSelection('', '-');
      return;
    }
    
    // Simulate user selecting lokasi asal
    const userMsg = { 
      id: generateUniqueId('u-'), 
      role: "user", 
      text: lokasi.nama,
      createdAt: Date.now() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Process the selection
    await processLokasiAsalSelection(lokasi.id, lokasi.nama);
  };

  const processLokasiAsalSelection = async (lokasiId, lokasiNama) => {
    try {
      setSending(true);
      
      // Handle no lokasi asal case
      if (lokasiId === '' || lokasiNama === '-') {
        // Update current kegiatan with no lokasi asal
        setCollectedData(prev => {
          const updatedKegiatan = [...prev.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            lokasi_asal_id: '',
            lokasi_asal_nama: ''
          };
          return { ...prev, kegiatan: updatedKegiatan };
        });
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Tidak ada lokasi asal. Tanya lokasi tujuan.`);
          } catch (error) {
            console.warn("AI failed for no lokasi asal, using fallback:", error.message);
            responseText = `✅ Tidak ada lokasi asal. Lokasi tujuan di mana? (ketik - jika tidak ada)`;
          }
        } else {
          responseText = `✅ Tidak ada lokasi asal. Lokasi tujuan di mana? (ketik - jika tidak ada)`;
        }
        
        const lokasiTujuanListWithOptions = [
          { id: 'no-lokasi-tujuan', nama: '-' },
          ...getFilteredLokasi()
        ];
        
        responseText = `${responseText}\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`;
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText,
          hasLokasiTujuanList: true,
          lokasiTujuanList: lokasiTujuanListWithOptions,
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        setQuickReplies([]);
        setCurrentStep(ConversationStep.KEGIATAN_LOKASI_TUJUAN);
        console.log("✅ No lokasi asal selected");
        return;
      }
      
      const lokasi = lokasiData.find(l => l.id === lokasiId);
      
      if (lokasi) {
        // Update current kegiatan with lokasi asal
        setCollectedData(prev => {
          const updatedKegiatan = [...prev.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            lokasi_asal_id: lokasi.id.toString(),
            lokasi_asal_nama: lokasi.nama,
            lokasi_asal: lokasi
          };
          return { ...prev, kegiatan: updatedKegiatan };
        });
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Lokasi asal ${lokasi.nama} dipilih. Tanya lokasi tujuan.`);
          } catch (error) {
            console.warn("AI failed for lokasi asal, using fallback:", error.message);
            responseText = `✅ Lokasi asal ${lokasi.nama} dicatat. Lokasi tujuan di mana? (ketik - jika tidak ada)`;
          }
        } else {
          responseText = `✅ Lokasi asal ${lokasi.nama} dicatat. Lokasi tujuan di mana? (ketik - jika tidak ada)`;
        }
        
        const lokasiTujuanListWithOptions = [
          { id: 'no-lokasi-tujuan', nama: '-' },
          ...getFilteredLokasi()
        ];
        
        responseText = `${responseText}\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`;
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText,
          hasLokasiTujuanList: true,
          lokasiTujuanList: lokasiTujuanListWithOptions,
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        setQuickReplies([]);
        setCurrentStep(ConversationStep.KEGIATAN_LOKASI_TUJUAN);
        console.log("✅ Lokasi asal selected from click:", lokasi.nama);
      }
    } catch (error) {
      console.log('Error processing lokasi asal selection:', error);
      const errorMsg = { 
        id: generateUniqueId('a-'), 
        role: "assistant", 
        text: '❌ Terjadi kesalahan saat memilih lokasi asal. Silakan coba lagi.', 
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleLokasiTujuanClick = async (lokasi) => {
    // Handle special case for "no lokasi"
    if (lokasi === '-' || lokasi.nama === '-') {
      const userMsg = { 
        id: generateUniqueId('u-'), 
        role: "user", 
        text: '-',
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Process no lokasi tujuan selection
      await processLokasiTujuanSelection('', '-');
      return;
    }
    
    // Simulate user selecting lokasi tujuan
    const userMsg = { 
      id: generateUniqueId('u-'), 
      role: "user", 
      text: lokasi.nama,
      createdAt: Date.now() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Process the selection
    await processLokasiTujuanSelection(lokasi.id, lokasi.nama);
  };

  const processLokasiTujuanSelection = async (lokasiId, lokasiNama) => {
    try {
      setSending(true);
      
      // Handle no lokasi tujuan case
      if (lokasiId === '' || lokasiNama === '-') {
        // Update current kegiatan with no lokasi tujuan
        setCollectedData(prev => {
          const updatedKegiatan = [...prev.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            lokasi_tujuan_id: '',
            lokasi_tujuan_nama: ''
          };
          return { ...prev, kegiatan: updatedKegiatan };
        });
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Tidak ada lokasi tujuan. Tanya waktu mulai.`);
          } catch (error) {
            console.warn("AI failed for no lokasi tujuan, using fallback:", error.message);
            responseText = `✅ Tidak ada lokasi tujuan. Waktu mulai jam berapa?`;
          }
        } else {
          responseText = `✅ Tidak ada lokasi tujuan. Waktu mulai jam berapa?`;
        }
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText, 
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        setCurrentStep(ConversationStep.KEGIATAN_HARI);
        setQuickReplies(getStepQuickReplies(ConversationStep.KEGIATAN_HARI));
        console.log("✅ No lokasi tujuan selected");
        return;
      }
      
      const lokasi = lokasiData.find(l => l.id === lokasiId);
      
      if (lokasi) {
        // Update current kegiatan with lokasi tujuan
        setCollectedData(prev => {
          const updatedKegiatan = [...prev.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            lokasi_tujuan_id: lokasi.id.toString(),
            lokasi_tujuan_nama: lokasi.nama,
            lokasi_tujuan: lokasi
          };
          return { ...prev, kegiatan: updatedKegiatan };
        });
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Lokasi tujuan ${lokasi.nama} dipilih. Tanya waktu mulai.`);
          } catch (error) {
            console.warn("AI failed for lokasi tujuan, using fallback:", error.message);
            responseText = `✅ Lokasi tujuan ${lokasi.nama} dicatat. Waktu mulai jam berapa?`;
          }
        } else {
          responseText = `✅ Lokasi tujuan ${lokasi.nama} dicatat. Waktu mulai jam berapa?`;
        }
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText, 
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        setCurrentStep(ConversationStep.KEGIATAN_HARI);
        setQuickReplies(getStepQuickReplies(ConversationStep.KEGIATAN_HARI));
        console.log("✅ Lokasi tujuan selected from click:", lokasi.nama);
      }
    } catch (error) {
      console.log('Error processing lokasi tujuan selection:', error);
      const errorMsg = { 
        id: generateUniqueId('a-'), 
        role: "assistant", 
        text: '❌ Terjadi kesalahan saat memilih lokasi tujuan. Silakan coba lagi.', 
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const processPenyewaSelection = async (penyewaName) => {
    try {
      setSending(true);
      
      const penyewa = penyewaData.find(p => p.nama === penyewaName);
      
      if (penyewa) {
        setCollectedData(prev => ({ 
          ...prev, 
          penyewa_id: penyewa.id.toString(),
          penyewa_nama: penyewa.nama,
          penyewa: penyewa
        }));
        
        let responseText;
        if (useAI && modelRef.current) {
          try {
            responseText = await askGemini(`Penyewa ${penyewa.nama} dipilih. Tanya equipment yang digunakan.`);
          } catch (error) {
            console.warn("AI failed for penyewa, using fallback:", error.message);
            responseText = `✅ Penyewa ${penyewa.nama} dicatat. Equipment apa yang digunakan?`;
          }
        } else {
          responseText = `✅ Penyewa ${penyewa.nama} dicatat. Equipment apa yang digunakan?`;
        }
        
        // Get filtered equipment based on user type
        const filteredEquipment = getFilteredEquipment();
        setEquipmentList(filteredEquipment);
        
          const equipmentResponseText = `${responseText}\n\n💡 Pilih dari daftar equipment di bawah:\n\nKamu juga bisa langsung mengetik kode equipmentnya kok, Athi juga bisa faham sayang... 😊`;
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: equipmentResponseText,
          hasEquipmentList: true,
          equipmentList: filteredEquipment,
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        
        setQuickReplies([]);
        setCurrentStep(ConversationStep.EQUIPMENT_INPUT);
        console.log("✅ Penyewa selected from click:", penyewa.nama);
      }
    } catch (error) {
      console.log('Error processing penyewa selection:', error);
      const errorMsg = { 
        id: generateUniqueId('a-'), 
        role: "assistant", 
        text: '❌ Terjadi kesalahan saat memilih penyewa. Silakan coba lagi.', 
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const onSend = async (quickReplyText = null) => {
    const text = (quickReplyText || input).trim();
    if (!text || sending) return;
    
    const userMsg = { id: generateUniqueId('u-'), role: "user", text, createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setQuickReplies(null);

    try {
      setSending(true);
      console.log("🔄 Processing message:", text, "at step:", currentStep);
      
      // Check for conversation type first (playful, joke, complaint, general)
      const conversationType = detectConversationType(text);
      console.log("🎭 Conversation type detected:", conversationType);
      
      if (conversationType !== 'normal') {
        let responseText = "";
        
        switch (conversationType) {
          case 'playful':
            responseText = getPlayfulResponse(text, currentStep);
            break;
          case 'joke':
            responseText = getJokeResponse(text, currentStep);
            break;
          case 'complaint':
            responseText = getComplaintResponse(text, currentStep);
            // Add the step-specific question
            const stepQuestion = getStepQuestion(currentStep);
            responseText += stepQuestion;
            break;
          case 'general':
            responseText = getGeneralResponse(text, currentStep);
            // Add the step-specific question
            const stepQ = getStepQuestion(currentStep);
            responseText += stepQ;
            break;
        }
        
        // Get appropriate quick replies for the current step
        const nextQuickReplies = getStepQuickReplies(currentStep);
        
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText, 
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
        setQuickReplies(nextQuickReplies);
        setSending(false);
        return;
      }
      
      // Check for repeat command
      const repeatStep = handleRepeatCommand(text);
      if (repeatStep) {
        console.log("🔄 Repeat command detected, going to step:", repeatStep);
        setCurrentStep(repeatStep);
        const response = typeof getRepeatResponse(repeatStep) === 'function' 
          ? getRepeatResponse(repeatStep)() 
          : getRepeatResponse(repeatStep);
        
        // Check if response has penyewa list
        if (response && typeof response === 'object' && response.hasPenyewaList) {
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: response.text,
            hasPenyewaList: true,
            penyewaList: response.penyewaList,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          setQuickReplies([]);
        } else {
          const nextQuickReplies = getRepeatQuickReplies(repeatStep);
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: response, 
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          setQuickReplies(nextQuickReplies);
        }
        setSending(false);
        return;
      }
      
      if (useAI && aiInitialized) {
        const typingMsg = { 
          id: generateUniqueId('typing-'), 
          role: "assistant", 
          text: "loading", 
          createdAt: Date.now(),
          isTyping: true 
        };
        setMessages(prev => [...prev, typingMsg]);
      }
      
      let responseText = "";
      let nextQuickReplies = null;

      if (currentStep === ConversationStep.DATE_INPUT) {
        const today = new Date().toISOString().split('T')[0];
        let dateValue;
        
        if (text.toLowerCase().includes('hari ini') || text.toLowerCase().includes('today')) {
          dateValue = today;
        } else {
          // Coba parsing tanggal dengan berbagai format
          dateValue = parseDateInput(text);
        }
        
        if (!dateValue) {
          responseText = `❌ Format tanggal tidak dikenali. Coba format seperti:\n• "hari ini"\n• "21 Okt 2025"\n• "21 Oktober 2025"\n• "21/10/2025"\n• "2025-10-21"`;
        } else {
          // Validate date
          const validationError = await validateField('tanggal', dateValue);
          if (validationError) {
            responseText = `❌ ${validationError}. Coba lagi dengan format yang benar.`;
          } else {
            setCollectedData(prev => ({ ...prev, tanggal: dateValue }));
            
            // Format tanggal untuk display
            const displayDate = new Date(dateValue + 'T00:00:00').toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            
            if (useAI) {
              try {
                responseText = await askGemini(`User input tanggal: ${dateValue} (${displayDate}). Konfirmasi dengan antusias dan tanya kategori pekerjaan.`);
              } catch (e) {
                responseText = `✅ Oke! Tanggal ${displayDate} dicatat. Kategori pekerjaan apa?`;
              }
            } else {
              responseText = `✅ Oke! Tanggal ${displayDate} dicatat. Kategori pekerjaan apa?`;
            }
            
            nextQuickReplies = [
              { label: 'Barging', value: 'barging' },
              { label: 'Mining', value: 'mining' },
              { label: 'Rental', value: 'rental' }
            ];
            setCurrentStep(ConversationStep.KATEGORI_INPUT);
          }
        }
      }
      else if (currentStep === ConversationStep.KATEGORI_INPUT) {
        const validCategories = ['barging', 'mining', 'rental'];
        if (validCategories.includes(text.toLowerCase())) {
          setCollectedData(prev => ({ ...prev, activity: text.toLowerCase() }));
          
          const categoryText = text.toLowerCase();
          let cuteResponse = '';
          
          if (categoryText === 'mining') {
            cuteResponse = 'Wihh, mining! 🏔️ Kerja di tambang, pasti seru! Oke deh Athi catat... Siapa nama penyewanya?';
          } else if (categoryText === 'barging') {
            cuteResponse = 'Ooooh, barging! 🚢 Di air ya? Asik! Athi catat dulu ya... Siapa nama penyewanya?';
          } else if (categoryText === 'rental') {
            cuteResponse = 'Rental! 🏗️ Wah, alat berat kita disewain nih! Oke deh... Siapa nama penyewanya?';
          }
          
          if (useAI) {
            try {
              responseText = await askGemini(`User pilih kategori ${text}. Berikan response yang manis dan tanya nama penyewa.`);
            } catch (e) {
              responseText = cuteResponse;
            }
          } else {
            responseText = cuteResponse;
          }
          
          // Tampilkan semua penyewa sebagai chat response dengan format untuk klik
          const penyewaList = penyewaData.map((p, index) => 
            `${index + 1}. ${p.nama}`
          ).join('\n');
          
          responseText = `${cuteResponse}\n\n💡 Ketik nama penyewa atau pilih dari daftar di bawah:`;
          
          // Simpan data penyewa untuk keperluan klik
          setPenyewaList(penyewaData);
          
          // Create message with penyewa list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasPenyewaList: true,
            penyewaList: penyewaData,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = []; // Kosongkan quick replies
          setCurrentStep(ConversationStep.PENYEWA_INPUT);
          

        } else {
          responseText = `❌ Kategori "${text}" tidak valid. Pilih: Barging, Mining, atau Rental.`;
          nextQuickReplies = [
            { label: 'Barging', value: 'barging' },
            { label: 'Mining', value: 'mining' },
            { label: 'Rental', value: 'rental' }
          ];
        }
      }
      else if (currentStep === ConversationStep.PENYEWA_INPUT) {
        console.log("🔍 Searching for penyewa:", text, "in", penyewaData.length, "items");
        console.log("📋 Available penyewa:", penyewaData.map(p => p.nama).slice(0, 10));
        
        const searchTerm = text.toLowerCase().trim();
        const penyewa = penyewaData.find(p => 
          p.nama.toLowerCase() === searchTerm ||
          p.nama.toLowerCase().includes(searchTerm) ||
          searchTerm.includes(p.nama.toLowerCase())
        );
        
        console.log("🎯 Search result:", penyewa ? `Found: ${penyewa.nama}` : "Not found");
        
        if (penyewa) {
          setCollectedData(prev => ({ 
            ...prev, 
            penyewa_id: penyewa.id.toString(),
            penyewa_nama: penyewa.nama,
            penyewa: penyewa
          }));
          
          if (useAI && aiInitialized) {
            try {
              responseText = await askGemini(`Penyewa ${penyewa.nama} dipilih. Tanya equipment yang digunakan.`);
              if (!responseText || responseText.trim().length === 0) {
                responseText = `✅ Penyewa ${penyewa.nama} dicatat. Equipment apa yang digunakan?`;
              }
            } catch (error) {
              console.warn("AI failed for penyewa, using fallback:", error.message);
              responseText = `✅ Penyewa ${penyewa.nama} dicatat. Equipment apa yang digunakan?`;
            }
          } else {
            responseText = `✅ Penyewa ${penyewa.nama} dicatat. Equipment apa yang digunakan?`;
          }
          
          // Get filtered equipment based on user type
          const filteredEquipment = getFilteredEquipment();
          setEquipmentList(filteredEquipment);
          
        const equipmentResponseText = `${responseText}\n\n💡 Pilih dari daftar equipment di bawah:\n\nKamu juga bisa langsung mengetik kode equipmentnya kok, Athi juga bisa faham sayang... 😊`;
          
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: equipmentResponseText,
            hasEquipmentList: true,
            equipmentList: filteredEquipment,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          setCurrentStep(ConversationStep.EQUIPMENT_INPUT);
          console.log("✅ Penyewa step completed, response:", responseText);
        } else {
          responseText = `❌ Penyewa "${text}" tidak ditemukan.\n\n💡 Pilih dari daftar penyewa di bawah:`;
          
          // Create message with penyewa list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasPenyewaList: true,
            penyewaList: penyewaData,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = []; // Kosongkan quick replies
          console.log("❌ Penyewa not found:", text);
          console.log("📋 Showing options:", penyewaData.slice(0, 8).map(p => p.nama));
        }
      }
      else if (currentStep === ConversationStep.EQUIPMENT_INPUT) {
        const filteredEquipment = getFilteredEquipment();
        console.log("🔍 Searching for equipment:", text, "in all equipment data");
        
        const searchTerm = text.toLowerCase().trim();
        
        // Search in ALL equipment data when user types manually
        const equipment = equipmentData.find(e => 
          e.kode.toLowerCase() === searchTerm ||
          e.nama.toLowerCase().includes(searchTerm) ||
          searchTerm.includes(e.kode.toLowerCase())
        );
        
        console.log("🎯 Equipment search result:", equipment ? `Found: ${equipment.kode} - ${equipment.nama} (${equipment.kategori})` : "Not found");
        console.log("📊 Searched in:", equipmentData.length, "total equipment items");
        
        if (equipment) {
          setCollectedData(prev => ({ 
            ...prev, 
            equipment_id: equipment.id.toString(),
            equipment_nama: equipment.kode,
            equipment_kategori: equipment.kategori,
            equipment: equipment
          }));
          
          if (useAI && aiInitialized) {
            try {
              responseText = await askGemini(`Equipment ${equipment.kode} (${equipment.nama}) dipilih. Tanya shift kerja.`);
              if (!responseText || responseText.trim().length === 0) {
                responseText = `✅ Equipment ${equipment.kode} (${equipment.nama}) dicatat. Shift apa?`;
              }
            } catch (error) {
              console.warn("AI failed for equipment, using fallback:", error.message);
              responseText = `✅ Equipment ${equipment.kode} (${equipment.nama}) dicatat. Shift apa?`;
            }
          } else {
            responseText = `✅ Equipment ${equipment.kode} (${equipment.nama}) dicatat. Shift apa?`;
          }
          
          nextQuickReplies = shiftData.map(s => ({ label: s.nama, value: s.nama }));
          setCurrentStep(ConversationStep.SHIFT_INPUT);
          console.log("✅ Equipment step completed, response:", responseText);
        } else {
          const userType = user?.usertype || employee?.usertype || '';
          const categoryText = userType.toLowerCase() === 'driver' ? '(DT)' : userType.toLowerCase() === 'operator' ? '(HE)' : '';
          
          responseText = `❌ Equipment "${text}" tidak ditemukan di semua data equipment.\n\n💡 Pilih dari daftar equipment ${categoryText} di bawah:\n\nKamu juga bisa langsung mengetik kode equipmentnya kok, Athi juga bisa faham sayang... 😊`;
          
          // Create message with equipment list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasEquipmentList: true,
            equipmentList: filteredEquipment,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          console.log("❌ Equipment not found:", text);
          console.log("📋 Showing equipment options:", filteredEquipment.length, "items");
        }
      }
      else if (currentStep === ConversationStep.SHIFT_INPUT) {
        console.log("🔍 Searching for shift:", text, "in", shiftData.length, "items");
        
        const searchTerm = text.toLowerCase().trim();
        const shift = shiftData.find(s => 
          s.nama.toLowerCase() === searchTerm ||
          s.nama.toLowerCase().includes(searchTerm)
        );
        
        console.log("🎯 Shift search result:", shift ? `Found: ${shift.nama}` : "Not found");
        
        if (shift) {
          setCollectedData(prev => ({ 
            ...prev, 
            shift_id: shift.id.toString(),
            shift_nama: shift.nama,
            shift: shift
          }));
          
          if (useAI && aiInitialized) {
            try {
              responseText = await askGemini(`Shift ${shift.nama} dipilih. Tanya longshift (opsional).`);
              if (!responseText || responseText.trim().length === 0) {
                responseText = `✅ Shift ${shift.nama} dicatat. Ada longshift? (ketik - jika tidak ada)`;
              }
            } catch (error) {
              console.warn("AI failed for shift, using fallback:", error.message);
              responseText = `✅ Shift ${shift.nama} dicatat. Ada longshift? (ketik - jika tidak ada)`;
            }
          } else {
            responseText = `✅ Shift ${shift.nama} dicatat. Ada longshift? (ketik - jika tidak ada)`;
          }
          
          nextQuickReplies = [
            { label: '-', value: '-' },
            ...longshiftData.map(l => ({ label: l.nama, value: l.nama }))
          ];
          setCurrentStep(ConversationStep.LONGSHIFT_INPUT);
          console.log("✅ Shift step completed, response:", responseText);
        } else {
          const availableShifts = shiftData.map(s => s.nama).join(', ');
          responseText = `❌ Shift "${text}" tidak ditemukan. Pilihan: ${availableShifts}`;
          nextQuickReplies = shiftData.map(s => ({ label: s.nama, value: s.nama }));
          console.log("❌ Shift not found:", text);
          console.log("📋 Available shifts:", shiftData.map(s => s.nama));
        }
      }
      else if (currentStep === ConversationStep.LONGSHIFT_INPUT) {
        if (text === '-') {
          setCollectedData(prev => ({ 
            ...prev, 
            longshift_id: 0,
            longshift_nama: '',
            overtime: 'ls0'
          }));
          } else {
            console.log("🔍 Searching for longshift:", text, "in", longshiftData.length, "items");
            
            const searchTerm = text.toLowerCase().trim();
            const longshift = longshiftData.find(l => 
              l.nama.toLowerCase() === searchTerm ||
              l.nama.toLowerCase().includes(searchTerm)
            );
            
            console.log("🎯 Longshift search result:", longshift ? `Found: ${longshift.nama}` : "Not found");
            
            if (longshift) {
              setCollectedData(prev => ({ 
                ...prev, 
                longshift_id: longshift.id,
                longshift_nama: longshift.nama,
                overtime: longshift.kode || 'ls0'
              }));
            } else {
              const availableLongshifts = longshiftData.map(l => l.nama).join(', ');
              responseText = `❌ Longshift "${text}" tidak ditemukan. Pilihan: ${availableLongshifts} atau ketik - untuk tidak ada`;
              nextQuickReplies = [
                { label: '-', value: '-' },
                ...longshiftData.map(l => ({ label: l.nama, value: l.nama }))
              ];
              console.log("❌ Longshift not found:", text);
              console.log("📋 Available longshifts:", longshiftData.map(l => l.nama));
              setSending(false);
              return;
            }
          }
          
          if (useAI && aiInitialized) {
            try {
              responseText = await askGemini(`Longshift sudah dicatat. Tanya HM/KM Start dan Finish.`);
              if (!responseText || responseText.trim().length === 0) {
                responseText = `✅ Longshift dicatat. HM/KM Start berapa?`;
              }
            } catch (error) {
              console.warn("AI failed for longshift, using fallback:", error.message);
              responseText = `✅ Longshift dicatat. HM/KM Start berapa?`;
            }
          } else {
            responseText = `✅ Longshift dicatat. HM/KM Start berapa?`;
          }
          
          setCurrentStep(ConversationStep.SMU_INPUT);
          console.log("✅ Longshift step completed, response:", responseText);
      }
      else if (currentStep === ConversationStep.SMU_INPUT) {
        if (!collectedData.smuStart) {
          const smuStart = parseFloat(text);
          if (isNaN(smuStart) || smuStart < 0) {
            responseText = `❌ HM/KM Start tidak valid. Masukkan angka positif.`;
          } else {
            setCollectedData(prev => ({ ...prev, smuStart }));
            responseText = `✅ HM/KM Start ${smuStart} dicatat. HM/KM Finish berapa?`;
          }
        } else {
          const smuFinish = parseFloat(text);
          if (isNaN(smuFinish) || smuFinish < collectedData.smuStart) {
            responseText = `❌ HM/KM Finish tidak valid. Harus lebih besar dari Start (${collectedData.smuStart}).`;
          } else {
            const usedSmu = smuFinish - collectedData.smuStart;
            setCollectedData(prev => ({ 
              ...prev, 
              smuFinish, 
              smustart: collectedData.smuStart,
              smufinish: smuFinish,
              usedsmu: usedSmu
            }));
            
            if (useAI) {
              try {
                responseText = await askGemini(`HM/KM sudah dicatat. Tanya refuel BBM (liter).`);
              } catch (e) {
                responseText = `✅ HM/KM Finish ${smuFinish} dicatat (used: ${usedSmu}). Refuel BBM berapa liter? (default: 0)`;
              }
            } else {
              responseText = `✅ HM/KM Finish ${smuFinish} dicatat (used: ${usedSmu}). Refuel BBM berapa liter? (default: 0)`;
            }
            
            setCurrentStep(ConversationStep.BBM_INPUT);
          }
        }
      }
      else if (currentStep === ConversationStep.BBM_INPUT) {
        const bbm = text === '' || text === '-' ? 0 : parseFloat(text);
        if (isNaN(bbm) || bbm < 0) {
          responseText = `❌ BBM tidak valid. Masukkan angka positif atau 0.`;
        } else {
          setCollectedData(prev => ({ 
            ...prev, 
            bbm,
            equipment_tool: 'Bucket' // Set default equipment tool
          }));
          
          if (useAI) {
            try {
              responseText = await askGemini(`BBM ${bbm} liter dicatat. Sekarang mulai input kegiatan.`);
            } catch (e) {
              responseText = `✅ BBM ${bbm} liter dicatat. Sekarang input kegiatan pertama.`;
            }
          } else {
            responseText = `✅ BBM ${bbm} liter dicatat. Sekarang input kegiatan pertama.`;
          }
          
          setCurrentStep(ConversationStep.KEGIATAN_JENIS);
        }
      }
      else if (currentStep === ConversationStep.KEGIATAN_JENIS) {
        // Get equipment kategori from collected data
        const equipmentKategori = collectedData.equipment_kategori || collectedData.equipment?.kategori;
        console.log("🔍 Searching for kegiatan:", text, "for equipment kategori:", equipmentKategori);
        
        // Search in ALL kegiatan data when user types manually
        const kegiatan = kegiatanData.find(k => 
          k.nama.toLowerCase() === text.toLowerCase() ||
          k.nama.toLowerCase().includes(text.toLowerCase()) ||
          text.toLowerCase().includes(k.nama.toLowerCase())
        );
        
        console.log("🎯 Kegiatan search result:", kegiatan ? `Found: ${kegiatan.nama} (${kegiatan.grpequipment})` : "Not found");
        
        if (kegiatan) {
          const updatedKegiatan = [...collectedData.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            kegiatan_id: kegiatan.id.toString(),
            kegiatan_nama: kegiatan.nama,
            kegiatan: kegiatan
          };
          setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
          
          if (useAI) {
            try {
              responseText = await askGemini(`Kegiatan ${kegiatan.nama} dipilih. Tanya material (opsional).`);
            } catch (e) {
              responseText = `✅ Kegiatan ${kegiatan.nama} dicatat. Material apa? (ketik - jika tidak ada)`;
            }
          } else {
            responseText = `✅ Kegiatan ${kegiatan.nama} dicatat. Material apa? (ketik - jika tidak ada)`;
          }
          
          nextQuickReplies = [
            { label: '-', value: '-' },
            ...materialData.slice(0, 6).map(m => ({ label: m.nama, value: m.nama }))
          ];
          setCurrentStep(ConversationStep.KEGIATAN_MATERIAL);
        } else {
          // Get filtered kegiatan for display
          const filteredKegiatan = getFilteredKegiatan(equipmentKategori);
          setKegiatanList(filteredKegiatan);
          
          responseText = `❌ Kegiatan "${text}" tidak ditemukan di semua data kegiatan.\n\n💡 Pilih dari daftar kegiatan ${equipmentKategori} di bawah:\n\nKamu juga bisa langsung mengetik nama kegiatannya kok, Athi juga bisa faham sayang... 😊`;
          
          // Create message with kegiatan list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasKegiatanList: true,
            kegiatanList: filteredKegiatan,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          console.log("❌ Kegiatan not found:", text);
          console.log("📋 Showing kegiatan options:", filteredKegiatan.length, "items");
        }
      }
      else if (currentStep === ConversationStep.KEGIATAN_MATERIAL) {
        const material = text === '-' ? null : materialData.find(m => m.nama.toLowerCase() === text.toLowerCase());
        const updatedKegiatan = [...collectedData.kegiatan];
        if (text === '-') {
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            material_id: '',
            material_nama: ''
          };
        } else if (material) {
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            material_id: material.id.toString(),
            material_nama: material.nama
          };
        } else {
          // Show material list when not found
          const materialListWithOptions = [
            { id: 'no-material', nama: '-' },
            ...materialData
          ];
          setMaterialList(materialListWithOptions);
          
          responseText = `❌ Material "${text}" tidak ditemukan di semua data material.\n\n💡 Pilih dari daftar material di bawah:\n\nKamu juga bisa langsung mengetik nama materialnya kok, Athi juga bisa faham sayang... 😊`;
          
          // Create message with material list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasMaterialList: true,
            materialList: materialData,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          console.log("❌ Material not found:", text);
          console.log("📋 Showing material options:", materialData.length, "items");
          setSending(false);
          return;
        }
        
        setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
        
        if (useAI) {
          try {
            responseText = await askGemini(`Material sudah dicatat. Tanya lokasi asal.`);
          } catch (e) {
            responseText = `✅ Material dicatat. Lokasi asal di mana?`;
          }
        } else {
          responseText = `✅ Material dicatat. Lokasi asal di mana?`;
        }
        
        nextQuickReplies = lokasiData.slice(0, 6).map(l => ({ label: l.nama, value: l.nama }));
        setCurrentStep(ConversationStep.KEGIATAN_LOKASI_ASAL);
      }
      else if (currentStep === ConversationStep.KEGIATAN_LOKASI_ASAL) {
        const lokasi = lokasiData.find(l => l.nama.toLowerCase() === text.toLowerCase());
        if (lokasi) {
          const updatedKegiatan = [...collectedData.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            lokasi_asal_id: lokasi.id.toString(),
            lokasi_asal_nama: lokasi.nama
          };
          setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
          
          if (useAI) {
            try {
              responseText = await askGemini(`Lokasi asal ${lokasi.nama} dipilih. Tanya lokasi tujuan (opsional).`);
            } catch (e) {
              responseText = `✅ Lokasi asal ${lokasi.nama} dicatat. Lokasi tujuan di mana? (ketik - jika tidak ada)`;
            }
          } else {
            responseText = `✅ Lokasi asal ${lokasi.nama} dicatat. Lokasi tujuan di mana? (ketik - jika tidak ada)`;
          }
          
          const lokasiTujuanListWithOptions = [
            { id: 'no-lokasi-tujuan', nama: '-' },
            ...getFilteredLokasi()
          ];
          
          responseText = `${responseText}\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`;
          
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasLokasiTujuanList: true,
            lokasiTujuanList: lokasiTujuanListWithOptions,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          setCurrentStep(ConversationStep.KEGIATAN_LOKASI_TUJUAN);
        } else {
          // Show lokasi asal list when not found
          const lokasiAsalListWithOptions = [
            { id: 'no-lokasi-asal', nama: '-' },
            ...getFilteredLokasi()
          ];
          setLokasiAsalList(lokasiAsalListWithOptions);
          
          responseText = `❌ Lokasi "${text}" tidak ditemukan di semua data lokasi.\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`;
          
          // Create message with lokasi asal list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasLokasiAsalList: true,
            lokasiAsalList: lokasiAsalListWithOptions,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          console.log("❌ Lokasi asal not found:", text);
          console.log("📋 Showing lokasi asal options:", lokasiAsalListWithOptions.length, "items");
        }
      }
      else if (currentStep === ConversationStep.KEGIATAN_LOKASI_TUJUAN) {
        const lokasi = text === '-' ? null : lokasiData.find(l => l.nama.toLowerCase() === text.toLowerCase());
        const updatedKegiatan = [...collectedData.kegiatan];
        if (text === '-') {
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            lokasi_tujuan_id: '',
            lokasi_tujuan_nama: ''
          };
        } else if (lokasi) {
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            lokasi_tujuan_id: lokasi.id.toString(),
            lokasi_tujuan_nama: lokasi.nama
          };
        } else {
          // Show lokasi tujuan list when not found
          const lokasiTujuanListWithOptions = [
            { id: 'no-lokasi-tujuan', nama: '-' },
            ...getFilteredLokasi()
          ];
          setLokasiTujuanList(lokasiTujuanListWithOptions);
          
          responseText = `❌ Lokasi "${text}" tidak ditemukan di semua data lokasi.\n\n💡 Pilih dari daftar lokasi cabang ${employee?.cabang?.nama} di bawah:\n\nKamu juga bisa langsung mengetik nama lokasinya kok, Athi juga bisa faham sayang... 😊`;
          
          // Create message with lokasi tujuan list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasLokasiTujuanList: true,
            lokasiTujuanList: lokasiTujuanListWithOptions,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          console.log("❌ Lokasi tujuan not found:", text);
          console.log("📋 Showing lokasi tujuan options:", lokasiTujuanListWithOptions.length, "items");
          setSending(false);
          return;
        }
        
        setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
        
        if (useAI) {
          try {
            responseText = await askGemini(`Lokasi sudah dicatat. Tanya waktu mulai (format HH:mm).`);
          } catch (e) {
            responseText = `✅ Lokasi dicatat. Waktu mulai jam berapa? (format: 08:00)`;
          }
        } else {
          responseText = `✅ Lokasi dicatat. Waktu mulai jam berapa? (format: 08:00)`;
        }
        
        setCurrentStep(ConversationStep.KEGIATAN_HARI);
        setQuickReplies(getStepQuickReplies(ConversationStep.KEGIATAN_HARI));
      }
      else if (currentStep === ConversationStep.KEGIATAN_HARI) {
        // Handle pemilihan hari untuk kegiatan
        const hariOptions = generateHariOptions();
        const selectedOption = hariOptions.find(option => 
          option.label.toLowerCase().includes(text.toLowerCase()) || 
          option.value === text
        );
        
        if (selectedOption) {
          // Simpan tanggal yang dipilih untuk kegiatan ini
          const updatedKegiatan = [...collectedData.kegiatan];
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            tanggalKegiatan: selectedOption.value,
            displayTanggal: selectedOption.displayDate
          };
          setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
          
          responseText = `📅 Tanggal dipilih: ${selectedOption.displayDate}\n🕐 Waktu mulai jam berapa?\nInput akan disimpan sebagai: ${selectedOption.value} HH:mm`;
          setCurrentStep(ConversationStep.KEGIATAN_WAKTU);
          setQuickReplies(getStepQuickReplies(ConversationStep.KEGIATAN_WAKTU));
        } else {
          responseText = `❌ Pilihan tidak valid. Silakan pilih:\n${hariOptions.map(h => `• ${h.label}`).join('\n')}`;
          setSending(false);
          return;
        }
      }
      else if (currentStep === ConversationStep.KEGIATAN_WAKTU) {
        const updatedKegiatan = [...collectedData.kegiatan];
        if (!updatedKegiatan[currentKegiatanIndex].starttime) {
          // Validasi format waktu
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(text)) {
            responseText = `❌ Format waktu tidak valid. Gunakan format HH:mm (contoh: 08:00)`;
            setSending(false);
            return;
          }
          
          // Gunakan tanggal kegiatan yang dipilih, fallback ke tanggal utama
          const tanggalKegiatan = updatedKegiatan[currentKegiatanIndex].tanggalKegiatan || collectedData.tanggal;
          const datetime = `${tanggalKegiatan} ${text}`;
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            starttime: datetime
          };
          setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
          responseText = `✅ Tersimpan: ${datetime}\n🕐 Waktu selesai jam berapa?\nInput akan disimpan sebagai: ${tanggalKegiatan} HH:mm`;
        } else {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(text)) {
            responseText = `❌ Format waktu tidak valid. Gunakan format HH:mm (contoh: 17:00)`;
            setSending(false);
            return;
          }
          
          // Gunakan tanggal kegiatan yang dipilih, fallback ke tanggal utama
          const tanggalKegiatan = updatedKegiatan[currentKegiatanIndex].tanggalKegiatan || collectedData.tanggal;
          const datetime = `${tanggalKegiatan} ${text}`;
          const startTime = new Date(updatedKegiatan[currentKegiatanIndex].starttime);
          let endTime = new Date(datetime);
          
          // Handle next day scenario (e.g., starttime 19:00, endtime 01:00)
          if (endTime <= startTime) {
            // Add 1 day to endtime
            endTime.setDate(endTime.getDate() + 1);
            // Format manually to avoid timezone issues
            const year = endTime.getFullYear();
            const month = String(endTime.getMonth() + 1).padStart(2, '0');
            const day = String(endTime.getDate()).padStart(2, '0');
            const hours = String(endTime.getHours()).padStart(2, '0');
            const minutes = String(endTime.getMinutes()).padStart(2, '0');
            const formattedEndTime = `${year}-${month}-${day} ${hours}:${minutes}`;
            responseText = `⏰ Terdeteksi kegiatan hingga hari berikutnya.\n✅ Tersimpan: ${formattedEndTime}`;
          } else {
            responseText = `✅ Tersimpan: ${datetime}`;
          }
          
          // Format manually to avoid timezone issues
          const year = endTime.getFullYear();
          const month = String(endTime.getMonth() + 1).padStart(2, '0');
          const day = String(endTime.getDate()).padStart(2, '0');
          const hours = String(endTime.getHours()).padStart(2, '0');
          const minutes = String(endTime.getMinutes()).padStart(2, '0');
          const formattedEndTime = `${year}-${month}-${day} ${hours}:${minutes}`;
          
          updatedKegiatan[currentKegiatanIndex] = {
            ...updatedKegiatan[currentKegiatanIndex],
            endtime: formattedEndTime
          };
          setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
          
          // Only update responseText if not already set by next day detection
          if (!responseText.includes('hari berikutnya')) {
            if (useAI) {
              try {
                responseText = await askGemini(`Waktu sudah dicatat. Tanya HM/KM per kegiatan (opsional).`);
              } catch (e) {
                responseText = `✅ Waktu selesai ${text} dicatat. HM/KM Start per kegiatan? (ketik - untuk skip)`;
              }
            } else {
              responseText = `✅ Waktu selesai ${text} dicatat. HM/KM Start per kegiatan? (ketik - untuk skip)`;
            }
          } else {
            // Append HM/KM question to next day detection message
            responseText += ` HM/KM Start per kegiatan? (ketik - untuk skip)`;
          }
          
          setCurrentStep(ConversationStep.KEGIATAN_HM);
        }
      }
      else if (currentStep === ConversationStep.KEGIATAN_HM) {
        const updatedKegiatan = [...collectedData.kegiatan];
        if (!updatedKegiatan[currentKegiatanIndex].smustart) {
          if (text === '-') {
            updatedKegiatan[currentKegiatanIndex] = {
              ...updatedKegiatan[currentKegiatanIndex],
              smustart: 0
            };
            responseText = `HM/KM Finish per kegiatan? (ketik - untuk skip)`;
          } else {
            const smu = parseFloat(text);
            if (isNaN(smu) || smu < 0) {
              responseText = `❌ HM/KM tidak valid. Masukkan angka positif atau - untuk skip.`;
              setSending(false);
              return;
            }
            updatedKegiatan[currentKegiatanIndex] = {
              ...updatedKegiatan[currentKegiatanIndex],
              smustart: smu
            };
            responseText = `✅ HM/KM Start ${smu} dicatat. HM/KM Finish per kegiatan?`;
          }
        } else {
          if (text === '-') {
            updatedKegiatan[currentKegiatanIndex] = {
              ...updatedKegiatan[currentKegiatanIndex],
              smufinish: 0
            };
          } else {
            const smu = parseFloat(text);
            if (isNaN(smu) || smu < updatedKegiatan[currentKegiatanIndex].smustart) {
              responseText = `❌ HM/KM Finish tidak valid. Harus lebih besar dari Start atau - untuk skip.`;
              setSending(false);
              return;
            }
            updatedKegiatan[currentKegiatanIndex] = {
              ...updatedKegiatan[currentKegiatanIndex],
              smufinish: smu
            };
          }
          
          if (useAI) {
            try {
              responseText = await askGemini(`HM/KM per kegiatan sudah dicatat. Tanya jumlah ritase.`);
            } catch (e) {
              responseText = `✅ HM/KM per kegiatan dicatat. Jumlah ritase berapa?`;
            }
          } else {
            responseText = `✅ HM/KM per kegiatan dicatat. Jumlah ritase berapa?`;
          }
          
          setCurrentStep(ConversationStep.KEGIATAN_RITASE);
        }
        setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
      }
      else if (currentStep === ConversationStep.KEGIATAN_RITASE) {
        const ritase = parseFloat(text);
        if (isNaN(ritase) || ritase < 0) {
          responseText = `❌ Jumlah ritase tidak valid. Masukkan angka positif.`;
          setSending(false);
          return;
        }
        
        const updatedKegiatan = [...collectedData.kegiatan];
        updatedKegiatan[currentKegiatanIndex] = {
          ...updatedKegiatan[currentKegiatanIndex],
          ritase: ritase
        };
        setCollectedData(prev => ({ ...prev, kegiatan: updatedKegiatan }));
        
        if (useAI) {
          try {
            responseText = await askGemini(`Ritase ${ritase} dicatat. Tanya apakah ada kegiatan lain.`);
          } catch (e) {
            responseText = `✅ Ritase ${ritase} dicatat. Ada kegiatan lain lagi?`;
          }
        } else {
          responseText = `✅ Ritase ${ritase} dicatat. Ada kegiatan lain lagi?`;
        }
        
        nextQuickReplies = [
          { label: '✅ Selesai', value: 'selesai' },
          { label: '➕ Tambah Kegiatan', value: 'tambah' }
        ];
        setCurrentStep(ConversationStep.KEGIATAN_ADD_MORE);
      }
      else if (currentStep === ConversationStep.KEGIATAN_ADD_MORE) {
        if (text.toLowerCase() === 'tambah') {
          // Add new kegiatan
          const newKegiatan = {
            id: generateUniqueId('kegiatan-'),
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
            seq: collectedData.kegiatan.length + 1,
          };
          
          setCollectedData(prev => ({ 
            ...prev, 
            kegiatan: [...prev.kegiatan, newKegiatan] 
          }));
          setCurrentKegiatanIndex(prev => prev + 1);
          
          if (useAI) {
            try {
              responseText = await askGemini(`User mau tambah kegiatan. Tanya jenis kegiatan untuk kegiatan baru.`);
            } catch (e) {
              responseText = `✅ Oke, input kegiatan baru. Jenis kegiatan apa?`;
            }
          } else {
            responseText = `✅ Oke, input kegiatan baru. Jenis kegiatan apa?`;
          }
          
          const filteredKegiatan = getFilteredKegiatan(collectedData.equipment_kategori);
          const equipmentKategori = collectedData.equipment_kategori;
          
          responseText = `✅ Oke, input kegiatan baru. Jenis kegiatan apa?\n\n💡 Pilih dari daftar kegiatan ${equipmentKategori} di bawah:\n\nKamu juga bisa langsung mengetik nama kegiatannya kok, Athi juga bisa faham sayang... 😊`;
          
          // Create message with kegiatan list
          const botMsg = { 
            id: generateUniqueId('a-'), 
            role: "assistant", 
            text: responseText,
            hasKegiatanList: true,
            kegiatanList: filteredKegiatan,
            createdAt: Date.now() 
          };
          setMessages(prev => [...prev, botMsg]);
          
          nextQuickReplies = [];
          setCurrentStep(ConversationStep.KEGIATAN_JENIS);
        } else {
          // Continue to keterangan
          if (useAI) {
            try {
              responseText = await askGemini(`Semua kegiatan sudah dicatat. Tanya keterangan (opsional).`);
            } catch (e) {
              responseText = `✅ Semua kegiatan sudah dicatat. Ada keterangan tambahan? (ketik - jika tidak ada)`;
            }
          } else {
            responseText = `✅ Semua kegiatan sudah dicatat. Ada keterangan tambahan? (ketik - jika tidak ada)`;
          }
          
          setCurrentStep(ConversationStep.KETERANGAN_INPUT);
        }
      }
      else if (currentStep === ConversationStep.KETERANGAN_INPUT) {
        const keterangan = text === '-' ? '' : text;
        setCollectedData(prev => ({ ...prev, keterangan }));
        
        if (useAI) {
          try {
            responseText = await askGemini(`Keterangan dicatat. Tanya foto (opsional).`);
          } catch (e) {
            responseText = `✅ Keterangan dicatat. Ada foto yang mau dilampirkan? (ketik - jika tidak ada)`;
          }
        } else {
          responseText = `✅ Keterangan dicatat. Ada foto yang mau dilampirkan? (ketik - jika tidak ada)`;
        }
        
        setCurrentStep(ConversationStep.FOTO_INPUT);
      }
      else if (currentStep === ConversationStep.FOTO_INPUT) {
        // Handle text input for photo step
        if (text.toLowerCase() === 'selesai' || text.toLowerCase() === 'done' || text === '-') {
          // User is done with photos, proceed to summary
          if (useAI) {
            try {
              responseText = await askGemini(`Foto dicatat. Tampilkan ringkasan data.`);
            } catch (e) {
              responseText = `✅ Foto dicatat. Berikut ringkasan data timesheet:`;
            }
          } else {
            responseText = `✅ Foto dicatat. Berikut ringkasan data timesheet:`;
          }
        } else {
          // User is still on photo step, remind them to use photo button
          responseText = `📷 Untuk menambahkan foto, gunakan tombol kamera di samping kiri input. Ketik "selesai" jika sudah selesai.`;
          setSending(false);
          return;
        }
        
        // Show summary
        const summaryData = {
          tanggal: moment(collectedData.tanggal, 'DD-MM-YYYY').format('YYYY-MM-DD'),
          kategori: collectedData.activity,
          penyewa: collectedData.penyewa_nama,
          equipment: `${collectedData.equipment_nama} (${collectedData.equipment_kategori})`,
          shift: collectedData.shift_nama,
          longshift: collectedData.longshift_nama || 'Tidak ada',
          smu: `${collectedData.smustart} - ${collectedData.smufinish} (used: ${collectedData.usedsmu})`,
          bbm: `${collectedData.bbm} liter`,
          equipment_tool: collectedData.equipment_tool,
          kegiatan: collectedData.kegiatan.map((k, i) => 
            `${i+1}. ${k.kegiatan_nama} - ${k.material_nama || 'Tidak ada'} - ${k.lokasi_asal_nama} → ${k.lokasi_tujuan_nama || 'Tidak ada'} - ${k.ritase} ritase`
          ).join('\n'),
          keterangan: collectedData.keterangan || 'Tidak ada',
          foto: uploadedPhotos.length > 0 ? `${uploadedPhotos.length} foto` : 'Tidak ada'
        };
        
        if (useAI) {
          try {
            const summaryPrompt = `Data timesheet lengkap: ${JSON.stringify(summaryData)}. Buat ringkasan yang rapi dengan emoji dan tanya konfirmasi apakah data sudah benar.`;
            responseText = await askGemini(summaryPrompt);
          } catch (e) {
            responseText = `\n📋 RINGKASAN TIMESHEET\n\n📅 Tanggal: ${summaryData.tanggal}\n🏷️ Kategori: ${summaryData.kategori}\n👤 Penyewa: ${summaryData.penyewa}\n🚜 Equipment: ${summaryData.equipment}\n⏰ Shift: ${summaryData.shift}\n🔄 Longshift: ${summaryData.longshift}\n📊 HM/KM: ${summaryData.smu}\n⛽ BBM: ${summaryData.bbm}\n🔧 Tool: ${summaryData.equipment_tool}\n\n📋 Kegiatan:\n${summaryData.kegiatan}\n\n📝 Keterangan: ${summaryData.keterangan}\n📷 Foto: ${summaryData.foto}\n\nApakah data sudah benar?`;
          }
        } else {
          responseText = `\n📋 RINGKASAN TIMESHEET\n\n📅 Tanggal: ${summaryData.tanggal}\n🏷️ Kategori: ${summaryData.kategori}\n👤 Penyewa: ${summaryData.penyewa}\n🚜 Equipment: ${summaryData.equipment}\n⏰ Shift: ${summaryData.shift}\n🔄 Longshift: ${summaryData.longshift}\n📊 HM/KM: ${summaryData.smu}\n⛽ BBM: ${summaryData.bbm}\n🔧 Tool: ${summaryData.equipment_tool}\n\n📋 Kegiatan:\n${summaryData.kegiatan}\n\n📝 Keterangan: ${summaryData.keterangan}\n📷 Foto: ${summaryData.foto}\n\nApakah data sudah benar?`;
        }
        
        nextQuickReplies = [
          { label: '✅ Submit', value: 'submit' },
          { label: '✏️ Edit', value: 'edit' },
          { label: '❌ Cancel', value: 'cancel' }
        ];
        setCurrentStep(ConversationStep.CONFIRMATION);
      }
      else if (currentStep === ConversationStep.CONFIRMATION) {
        if (text.toLowerCase() === 'submit') {
          try {
            // Validate all data before submission
            await timesheetValidationSchema.validate(collectedData);
            
            // Debug: Log photo data before submission
            console.log('📸 Submitting timesheet with photo data:');
            console.log('📸 collectedData.foto:', collectedData.foto);
            console.log('📸 collectedData.photo:', collectedData.photo);
            console.log('📸 uploadedPhotos:', uploadedPhotos);
            
            const result = await dispatch(submitTimesheet(collectedData));
            
             if (result.meta.requestStatus === 'fulfilled') {
               if (useAI) {
                 try {
                   responseText = await askGemini(`Timesheet berhasil disimpan. Ucapkan selamat dengan antusias dan tanya apakah mau input lagi.`);
                 } catch (e) {
                   responseText = `🎉 Yeay! Timesheet berhasil disimpan! Kerja kamu hebat! Mau input lagi?`;
                 }
               } else {
                 responseText = `🎉 Yeay! Timesheet berhasil disimpan! Kerja kamu hebat! Mau input lagi?`;
               }
              
              nextQuickReplies = [
                { label: 'Input Lagi', value: 'reset' },
                { label: 'Selesai', value: 'done' }
              ];
              setCurrentStep(ConversationStep.COMPLETED);
            } else {
              const errorMessage = result.payload || 'Gagal menyimpan TimeSheet';
              responseText = `❌ ${errorMessage}`;
            }
          } catch (validationError) {
            responseText = `❌ Validasi gagal: ${validationError.message}`;
          }
        } else if (text.toLowerCase() === 'edit') {
          responseText = '⚠️ Fitur edit belum tersedia. Silakan mulai ulang.';
        } else {
          responseText = '❌ Input timesheet dibatalkan.';
          setCurrentStep(ConversationStep.GREETING);
        }
      }
      else if (currentStep === ConversationStep.COMPLETED && text.toLowerCase() === 'reset') {
        // Reset data
        if (employee?.id) {
          const initialData = {
            tanggal: new Date().toISOString().split('T')[0],
            kategori: '',
            cabang_id: employee.cabang?.id?.toString() || '',
            cabang_nama: employee.cabang?.nama || '',
            cabang: employee.cabang || null,
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
            karyawan_id: employee.id?.toString() || '',
            karyawan: employee || null,
            operator_id: employee.id?.toString() || '',
            operator_nama: employee.nama || '',
            activity: '',
            smustart: 0,
            smufinish: 0,
            usedsmu: 0,
            bbm: 0,
            equipment_tool: 'Bucket',
            keterangan: '',
            photo: '',
            foto: [],
              kegiatan: [{
                id: generateUniqueId('kegiatan-'),
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
              }]
          };
          setCollectedData(initialData);
          setCurrentKegiatanIndex(0);
          setUploadedPhotos([]);
        }
        
         if (useAI) {
           try {
             responseText = await askGemini(`User mau input timesheet baru. Tanya tanggal dengan antusias.`);
           } catch (e) {
             responseText = '👍 Siap lagi! Yuk input timesheet baru. Tanggal berapa?';
           }
         } else {
           responseText = '👍 Siap lagi! Yuk input timesheet baru. Tanggal berapa?';
         }
        
        setCurrentStep(ConversationStep.DATE_INPUT);
      }

      if (useAI && aiInitialized) {
        setMessages(prev => prev.filter(m => !m.isTyping));
      }
      
      // Safety check: ensure we always have a response
      if (!responseText || responseText.trim().length === 0) {
        console.warn("Empty response detected, using fallback message for step:", currentStep);
        responseText = "✅ Data dicatat. Lanjut ke langkah berikutnya.";
      }
      
      console.log("📤 Sending response:", responseText.substring(0, 50) + "...");
      
        const botMsg = { 
          id: generateUniqueId('a-'), 
          role: "assistant", 
          text: responseText, 
          createdAt: Date.now() 
        };
        setMessages(prev => [...prev, botMsg]);
      setQuickReplies(nextQuickReplies);
      
    } catch (err) {
      console.log("Error:", err);
      const errMsg = { 
        id: generateUniqueId('a-'), 
        role: "assistant", 
        text: `Maaf, terjadi kesalahan. Silakan coba lagi.`, 
        createdAt: Date.now() 
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  // Loading animation
  useEffect(() => {
    if (sending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnimation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(loadingAnimation, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingAnimation.setValue(0);
    }
  }, [sending, loadingAnimation]);

  const getStepNumber = () => {
    const steps = {
      [ConversationStep.DATE_INPUT]: 1,
      [ConversationStep.KATEGORI_INPUT]: 2,
      [ConversationStep.PENYEWA_INPUT]: 3,
      [ConversationStep.EQUIPMENT_INPUT]: 4,
      [ConversationStep.SHIFT_INPUT]: 5,
      [ConversationStep.LONGSHIFT_INPUT]: 6,
      [ConversationStep.SMU_INPUT]: 7,
      [ConversationStep.BBM_INPUT]: 8,
      [ConversationStep.KEGIATAN_JENIS]: 9,
      [ConversationStep.KEGIATAN_MATERIAL]: 10.1,
      [ConversationStep.KEGIATAN_LOKASI_ASAL]: 10.2,
      [ConversationStep.KEGIATAN_LOKASI_TUJUAN]: 10.3,
      [ConversationStep.KEGIATAN_WAKTU]: 10.4,
      [ConversationStep.KEGIATAN_HM]: 10.5,
      [ConversationStep.KEGIATAN_RITASE]: 10.6,
      [ConversationStep.KEGIATAN_ADD_MORE]: 10.7,
      [ConversationStep.KETERANGAN_INPUT]: 11,
      [ConversationStep.FOTO_INPUT]: 12,
      [ConversationStep.CONFIRMATION]: 13,
    };
    return steps[currentStep] || 0;
  };

  const LoadingDots = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animateDot = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateDot(dot1, 0);
      animateDot(dot2, 200);
      animateDot(dot3, 400);
    }, []);

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
        <Animated.View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: appmode.txtcolor[mode][1],
            marginHorizontal: 2,
            opacity: dot1,
            transform: [
              {
                scale: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5],
                }),
              },
            ],
          }}
        />
        <Animated.View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: appmode.txtcolor[mode][1],
            marginHorizontal: 2,
            opacity: dot2,
            transform: [
              {
                scale: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5],
                }),
              },
            ],
          }}
        />
        <Animated.View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: appmode.txtcolor[mode][1],
            marginHorizontal: 2,
            opacity: dot3,
            transform: [
              {
                scale: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5],
                }),
              },
            ],
          }}
        />
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={{ paddingHorizontal: 12, marginVertical: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <View
          style={{
            maxWidth: '82%',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: isUser ? appmode.txtcolor[mode][6] : (isDark ? '#374151' : '#FFFFFF'),
            borderWidth: isUser ? 0 : 1,
            borderColor: isUser ? 'transparent' : appmode.boxlinecolor[mode][1],
          }}
        >
          {item.isTyping ? (
            <LoadingDots />
          ) : item.isPhoto ? (
            <View>
              <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20, marginBottom: 8 }}>{item.text}</Text>
              {item.photoUri && (
                <Image 
                  source={{ uri: item.photoUri }} 
                  style={{ 
                    width: 200, 
                    height: 150, 
                    borderRadius: 8,
                    resizeMode: 'cover'
                  }}
                />
              )}
            </View>
          ) : item.hasPenyewaList ? (
            <View>
              <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{item.text}</Text>
              <View style={{ flexDirection: 'column', gap: 6 }}>
                {item.penyewaList.map((penyewa, index) => (
                  <TouchableOpacity
                    key={`penyewa-${penyewa.id}-${index}`}
                    onPress={() => handlePenyewaClick(penyewa)}
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                      padding: 10,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: appmode.txtcolor[mode][6],
                    }}
                  >
                    <Text style={{ 
                      color: appmode.txtcolor[mode][1], 
                      fontSize: 13,
                      fontFamily: 'Poppins-Medium',
                    }}>
                      {index + 1}. {penyewa.nama}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : item.hasEquipmentList ? (
            <View>
              <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{item.text}</Text>
              <View style={{ flexDirection: 'column', gap: 6 }}>
                {item.equipmentList.map((equipment, index) => (
                  <TouchableOpacity
                    key={`equipment-${equipment.id}-${index}`}
                    onPress={() => handleEquipmentClick(equipment)}
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                      padding: 10,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: equipment.kategori === 'DT' ? '#10B981' : equipment.kategori === 'HE' ? '#F59E0B' : appmode.txtcolor[mode][6],
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ 
                        color: appmode.txtcolor[mode][1], 
                        fontSize: 13,
                        fontFamily: 'Poppins-Medium',
                        flex: 1
                      }}>
                        {index + 1}. {equipment.kode} - {equipment.nama}
                      </Text>
                      <View style={{
                        backgroundColor: equipment.kategori === 'DT' ? '#10B981' : equipment.kategori === 'HE' ? '#F59E0B' : '#6B7280',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontFamily: 'Poppins-Medium',
                        }}>
                          {equipment.kategori}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : item.hasKegiatanList ? (
            <View>
              <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{item.text}</Text>
              <View style={{ flexDirection: 'column', gap: 6 }}>
                {item.kegiatanList.map((kegiatan, index) => (
                  <TouchableOpacity
                    key={`kegiatan-${kegiatan.id}-${index}`}
                    onPress={() => handleKegiatanClick(kegiatan)}
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                      padding: 10,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: kegiatan.grpequipment === 'DT' ? '#10B981' : kegiatan.grpequipment === 'HE' ? '#F59E0B' : appmode.txtcolor[mode][6],
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ 
                        color: appmode.txtcolor[mode][1], 
                        fontSize: 13,
                        fontFamily: 'Poppins-Medium',
                        flex: 1
                      }}>
                        {index + 1}. {kegiatan.nama}
                      </Text>
                      <View style={{
                        backgroundColor: kegiatan.grpequipment === 'DT' ? '#10B981' : kegiatan.grpequipment === 'HE' ? '#F59E0B' : '#6B7280',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontFamily: 'Poppins-Medium',
                        }}>
                          {kegiatan.grpequipment}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : item.hasMaterialList ? (
            <View>
              <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{item.text}</Text>
              <View style={{ flexDirection: 'column', gap: 6 }}>
                {item.materialList.map((material, index) => (
                  <TouchableOpacity
                    key={`material-${material.id}-${index}`}
                    onPress={() => handleMaterialClick(material)}
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                      padding: 10,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: material.id === 'no-material' ? '#EF4444' : appmode.txtcolor[mode][6],
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ 
                        color: appmode.txtcolor[mode][1], 
                        fontSize: 13,
                        fontFamily: 'Poppins-Medium',
                        flex: 1
                      }}>
                        {index + 1}. {material.nama}
                      </Text>
                      <View style={{
                        backgroundColor: material.id === 'no-material' ? '#EF4444' : appmode.txtcolor[mode][6],
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontFamily: 'Poppins-Medium',
                        }}>
                          {material.id === 'no-material' ? 'Tidak Ada' : 'Material'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : item.hasLokasiAsalList ? (
            <View>
              <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{item.text}</Text>
              <View style={{ flexDirection: 'column', gap: 6 }}>
                {item.lokasiAsalList.map((lokasi, index) => (
                  <TouchableOpacity
                    key={`lokasi-asal-${lokasi.id}-${index}`}
                    onPress={() => handleLokasiAsalClick(lokasi)}
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                      padding: 10,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: lokasi.id === 'no-lokasi-asal' ? '#EF4444' : appmode.txtcolor[mode][6],
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ 
                        color: appmode.txtcolor[mode][1], 
                        fontSize: 13,
                        fontFamily: 'Poppins-Medium',
                        flex: 1
                      }}>
                        {index + 1}. {lokasi.nama}
                      </Text>
                      <View style={{
                        backgroundColor: lokasi.id === 'no-lokasi-asal' ? '#EF4444' : appmode.txtcolor[mode][6],
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontFamily: 'Poppins-Medium',
                        }}>
                          {lokasi.id === 'no-lokasi-asal' ? 'Tidak Ada' : 'Lokasi Asal'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : item.hasLokasiTujuanList ? (
            <View>
              <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{item.text}</Text>
              <View style={{ flexDirection: 'column', gap: 6 }}>
                {item.lokasiTujuanList.map((lokasi, index) => (
                  <TouchableOpacity
                    key={`lokasi-tujuan-${lokasi.id}-${index}`}
                    onPress={() => handleLokasiTujuanClick(lokasi)}
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                      padding: 10,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: lokasi.id === 'no-lokasi-tujuan' ? '#EF4444' : appmode.txtcolor[mode][6],
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ 
                        color: appmode.txtcolor[mode][1], 
                        fontSize: 13,
                        fontFamily: 'Poppins-Medium',
                        flex: 1
                      }}>
                        {index + 1}. {lokasi.nama}
                      </Text>
                      <View style={{
                        backgroundColor: lokasi.id === 'no-lokasi-tujuan' ? '#EF4444' : appmode.txtcolor[mode][6],
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontFamily: 'Poppins-Medium',
                        }}>
                          {lokasi.id === 'no-lokasi-tujuan' ? 'Tidak Ada' : 'Lokasi Tujuan'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ color: isUser ? '#FFFFFF' : appmode.txtcolor[mode][1], fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
          )}
          <Text style={{ color: isUser ? 'rgba(255,255,255,0.8)' : appmode.txtcolor[mode][3], fontSize: 10, marginTop: 4, textAlign: 'right' }}>
            {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <AppScreen>
      <AppHeader
        title="Chat Athi"
        prevPage={true}
        onChangeThemes={true}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => {
               setMessages([{ 
                 id: "m1", 
                 role: "assistant", 
                 text: "Halo "+employee?.nama+"! 👋 Saya Athi, asisten ceria untuk input timesheet kamu. Yuk kita mulai lagi! Mau input untuk tanggal berapa?\n\n💡 Contoh format:\n• \"hari ini\"\n• \"21 Okt 2025\"\n• \"21 Oktober 2025\"\n• \"21/10/2025\"", 
                 createdAt: Date.now() 
               }]);
              // Reset data
              if (employee?.id) {
                const initialData = {
                  tanggal: new Date().toISOString().split('T')[0],
                  kategori: '',
                  cabang_id: employee.cabang?.id?.toString() || '',
                  cabang_nama: employee.cabang?.nama || '',
                  cabang: employee.cabang || null,
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
                  karyawan_id: employee.id?.toString() || '',
                  karyawan: employee || null,
                  operator_id: employee.id?.toString() || '',
                  operator_nama: employee.nama || '',
                  activity: '',
                  smustart: 0,
                  smufinish: 0,
                  usedsmu: 0,
                  bbm: 0,
                  equipment_tool: 'Bucket',
                  keterangan: '',
                  photo: '',
                  foto: [],
                kegiatan: [{
                  id: generateUniqueId('kegiatan-'),
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
                }]
                };
                setCollectedData(initialData);
                setCurrentKegiatanIndex(0);
                setUploadedPhotos([]);
              }
              setCurrentStep(ConversationStep.DATE_INPUT);
              setQuickReplies(null);
            }} style={{ padding: 8 }}>
              <Ionicons name="refresh" size={22} color={appmode.txtcolor[mode][7]} />
            </TouchableOpacity>
          </View>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }}>
          {currentStep !== ConversationStep.COMPLETED && currentStep !== ConversationStep.GREETING && (
            <View style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 8, 
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: appmode.boxlinecolor[mode][1]
            }}>
              <Text style={{ 
                color: appmode.txtcolor[mode][6], 
                fontSize: 12, 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                📌 Step {Math.floor(getStepNumber())}/13
              </Text>
            </View>
          )}
          
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
          
          {quickReplies && quickReplies.length > 0 && (
            <View style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 8,
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: appmode.boxlinecolor[mode][1]
            }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {quickReplies.map((item, idx) => (
                    <TouchableOpacity
                      key={`${item.value}-${idx}-${Math.random().toString(36).substr(2, 9)}`}
                      onPress={() => handleQuickReply(item.value)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor: appmode.txtcolor[mode][6],
                        borderWidth: 1,
                        borderColor: appmode.txtcolor[mode][6],
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '500' }}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={() => {
              if (aiInitialized) {
                setUseAI(!useAI);
              } else {
                console.warn("AI not initialized, cannot enable");
              }
            }}
            style={{
              position: 'absolute',
              right: 16,
              bottom: quickReplies ? 120 : 70,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: useAI && aiInitialized ? appmode.txtcolor[mode][6] : (aiInitialized ? appmode.boxlinecolor[mode][1] : '#ef4444'),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              borderWidth: 2,
              borderColor: useAI && aiInitialized ? appmode.txtcolor[mode][6] : (aiInitialized ? appmode.boxlinecolor[mode][2] : '#dc2626'),
            }}
          >
            <Ionicons 
              name={aiInitialized ? (useAI ? "sparkles" : "sparkles-outline") : "warning"} 
              size={24} 
              color={useAI && aiInitialized ? '#FFFFFF' : (aiInitialized ? appmode.txtcolor[mode][4] : '#FFFFFF')} 
            />
            <Text style={{ 
              fontSize: 8, 
              fontWeight: '700',
              color: useAI && aiInitialized ? '#FFFFFF' : (aiInitialized ? appmode.txtcolor[mode][4] : '#FFFFFF'),
              marginTop: 2
            }}>
              {aiInitialized ? (useAI ? 'ON' : 'OFF') : 'ERR'}
            </Text>
          </TouchableOpacity>
          
          <View style={{ paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 6 : 4, flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: appmode.boxlinecolor[mode][1], backgroundColor: isDark ? '#111827' : '#FFFFFF' }}>
            {/* Camera Button - Only show on FOTO_INPUT step */}
            {currentStep === ConversationStep.FOTO_INPUT && (
              <TouchableOpacity 
                onPress={showPhotoOptions}
                disabled={sending}
                style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 22, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: sending ? appmode.boxlinecolor[mode][1] : appmode.txtcolor[mode][6],
                  marginRight: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Ionicons 
                  name="camera" 
                  size={20} 
                  color={sending ? appmode.txtcolor[mode][3] : '#FFFFFF'} 
                />
              </TouchableOpacity>
            )}
            
            <View style={{ flex: 1, minHeight: 40, maxHeight: 120, borderWidth: 1, borderColor: appmode.boxlinecolor[mode][1], borderRadius: 20, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 8 : 6, backgroundColor: isDark ? '#1F2937' : '#f9fafb', marginRight: 8 }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={currentStep === ConversationStep.FOTO_INPUT ? "Ketik 'selesai' jika sudah" : "Tulis pesan"}
                placeholderTextColor={appmode.txtcolor[mode][3]}
                style={{ color: appmode.txtcolor[mode][1], fontSize: 14 }}
                multiline
                returnKeyType="send"
                onSubmitEditing={() => onSend()}
              />
            </View>
            <TouchableOpacity onPress={() => onSend()} disabled={!input.trim() || sending} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: input.trim() && !sending ? appmode.txtcolor[mode][6] : appmode.boxlinecolor[mode][1] }}>
              <Ionicons name="send" size={18} color={input.trim() ? '#FFFFFF' : appmode.txtcolor[mode][3]} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
