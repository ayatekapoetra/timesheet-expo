import appmode from '@/src/helpers/ThemesMode';
import { useAppSelector } from '@/src/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/id';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function TimePickerModal({
  visible,
  selectedTime,
  onSelect,
  onClose,
  title = 'Pilih Waktu',
  showDateSelector = false,
  timesheetDate = null,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  
  // Set locale to Indonesian
  useEffect(() => {
    moment.locale('id');
  }, []);
  
  const [hours, setHours] = useState('07');
  const [minutes, setMinutes] = useState('00');
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isNextDay, setIsNextDay] = useState(false);

  useEffect(() => {
    if (visible && selectedTime) {
      const selectedMoment = moment(selectedTime);
      setHours(selectedMoment.format('HH'));
      setMinutes(selectedMoment.format('mm'));
      
      if (showDateSelector && timesheetDate) {
        const timesheetMoment = moment(timesheetDate);
        setSelectedDate(selectedMoment.clone());
        setIsNextDay(selectedMoment.isAfter(timesheetMoment, 'day'));
      }
    } else if (visible && !selectedTime) {
      setHours('07');
      setMinutes('00');
      if (showDateSelector && timesheetDate) {
        setSelectedDate(moment(timesheetDate));
        setIsNextDay(false);
      }
    }
  }, [visible, selectedTime, showDateSelector, timesheetDate]);

  const handleConfirm = () => {
    let finalDate = selectedDate.clone();
    
    if (showDateSelector && timesheetDate) {
      const timesheetMoment = moment(timesheetDate);
      finalDate = timesheetMoment.clone();
      
      if (isNextDay) {
        finalDate.add(1, 'day');
      }
    }
    
    finalDate.set('hour', parseInt(hours) || 0);
    finalDate.set('minute', parseInt(minutes) || 0);
    finalDate.set('second', 0);
    
    onSelect(finalDate.toISOString());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={[
              styles.container,
              {
                backgroundColor: isDark ? '#1F2937' : '#f2f4f7',
              },
            ]}>
            <View
              style={[
                styles.header,
                {
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  borderBottomColor: appmode.boxlinecolor[mode][1],
                },
              ]}>
              <Text
                style={[
                  styles.title,
                  { color: appmode.txtcolor[mode][1] },
                ]}>
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={appmode.txtcolor[mode][1]}
                />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.pickerContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              
              {showDateSelector && (
                <View style={styles.dateSection}>
                  <Text style={[styles.label, { color: appmode.txtcolor[mode][1], textAlign: 'center' }]}>
                    Pilih Tanggal
                  </Text>
                  <View style={styles.dateOptions}>
                    <TouchableOpacity
                      style={[
                        styles.dateOption,
                        {
                          backgroundColor: !isNextDay 
                            ? (isDark ? '#374151' : '#FFFFFF')
                            : (isDark ? '#1F2937' : '#f2f4f7'),
                          borderColor: appmode.boxlinecolor[mode][1],
                        }
                      ]}
                      onPress={() => setIsNextDay(false)}>
                      <Text style={[
                        styles.dateOptionText,
                        { 
                          color: !isNextDay 
                            ? appmode.txtcolor[mode][1]
                            : appmode.txtcolor[mode][2]
                        }
                      ]}>
                        {timesheetDate ? moment(timesheetDate).format('dddd') : moment().format('dddd')}
                      </Text>
                      <Text style={[
                        styles.dateOptionSubtext,
                        { 
                          color: !isNextDay 
                            ? appmode.txtcolor[mode][2]
                            : appmode.txtcolor[mode][3]
                        }
                      ]}>
                        {timesheetDate ? moment(timesheetDate).format('DD MMM YYYY') : moment().format('DD MMM YYYY')}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.dateOption,
                        {
                          backgroundColor: isNextDay 
                            ? (isDark ? '#374151' : '#FFFFFF')
                            : (isDark ? '#1F2937' : '#f2f4f7'),
                          borderColor: appmode.boxlinecolor[mode][1],
                        }
                      ]}
                      onPress={() => setIsNextDay(true)}>
                      <Text style={[
                        styles.dateOptionText,
                        { 
                          color: isNextDay 
                            ? appmode.txtcolor[mode][1]
                            : appmode.txtcolor[mode][2]
                        }
                      ]}>
                        {timesheetDate ? moment(timesheetDate).add(1, 'day').format('dddd') : moment().add(1, 'day').format('dddd')}
                      </Text>
                      <Text style={[
                        styles.dateOptionSubtext,
                        { 
                          color: isNextDay 
                            ? appmode.txtcolor[mode][2]
                            : appmode.txtcolor[mode][3]
                        }
                      ]}>
                        {timesheetDate ? moment(timesheetDate).add(1, 'day').format('DD MMM YYYY') : moment().add(1, 'day').format('DD MMM YYYY')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              <Text style={[styles.label, { color: appmode.txtcolor[mode][1] }]}>
                Masukkan Waktu (24 jam)
              </Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: isDark ? '#374151' : '#FFFFFF',
                      borderColor: appmode.boxlinecolor[mode][1],
                      color: appmode.txtcolor[mode][1],
                    },
                  ]}
                  value={hours}
                  onChangeText={(text) => {
                    if (text === '') {
                      setHours('');
                      return;
                    }
                    const num = parseInt(text);
                    if (!isNaN(num) && num >= 0 && num <= 23) {
                      setHours(text);
                    }
                  }}
                  onBlur={() => {
                    if (hours === '' || parseInt(hours) < 0) {
                      setHours('00');
                    } else if (hours.length === 1) {
                      setHours(hours.padStart(2, '0'));
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor={appmode.txtcolor[mode][2]}
                />
                <Text style={[styles.separator, { color: appmode.txtcolor[mode][1] }]}>:</Text>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: isDark ? '#374151' : '#FFFFFF',
                      borderColor: appmode.boxlinecolor[mode][1],
                      color: appmode.txtcolor[mode][1],
                    },
                  ]}
                  value={minutes}
                  onChangeText={(text) => {
                    if (text === '') {
                      setMinutes('');
                      return;
                    }
                    const num = parseInt(text);
                    if (!isNaN(num) && num >= 0 && num <= 59) {
                      setMinutes(text);
                    }
                  }}
                  onBlur={() => {
                    if (minutes === '' || parseInt(minutes) < 0) {
                      setMinutes('00');
                    } else if (minutes.length === 1) {
                      setMinutes(minutes.padStart(2, '0'));
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor={appmode.txtcolor[mode][2]}
                />
              </View>
              <Text style={[styles.preview, { color: appmode.txtcolor[mode][2] }]}>
                Preview: {hours}:{minutes} {showDateSelector && (isNextDay ? '(Besok)' : '(Hari Ini)')}
              </Text>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#3b82f6' }]}
                onPress={handleConfirm}>
                <Text style={styles.buttonText}>KONFIRMASI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ef4444', marginTop: 8 }]}
                onPress={onClose}>
                <Text style={styles.buttonText}>BATAL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  container: {
    maxHeight: height * 0.8,
    minHeight: height * 0.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  pickerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateOptions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateOption: {
    minWidth: 120,
    maxWidth: 160,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  dateOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateOptionSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 16,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timeInput: {
    width: 80,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 32,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  separator: {
    fontSize: 32,
    fontFamily: 'Poppins-Medium',
    marginHorizontal: 12,
  },
  preview: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    marginTop: 8,
  },
  buttonContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
  },
});