import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

const { height } = Dimensions.get('window');

export default function DatePickerModal({
  visible,
  selectedDate,
  onSelect,
  onClose,
  minDate,
  maxDate,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

  const handleSelect = (date) => {
    onSelect(date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={[styles.overlay, { zIndex: 2000 }]}>
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
              Pilih Tanggal
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={appmode.txtcolor[mode][1]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              minDate={minDate}
              maxDate={maxDate}
              onDayPress={(day) => handleSelect(day.dateString)}
              markedDates={{
                [selectedDate || '']: {
                  selected: true,
                  selectedColor: '#3b82f6',
                },
              }}
              theme={{
                backgroundColor: isDark ? '#374151' : '#FFFFFF',
                calendarBackground: isDark ? '#374151' : '#FFFFFF',
                textSectionTitleColor: appmode.txtcolor[mode][1],
                selectedDayBackgroundColor: '#3b82f6',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#3b82f6',
                dayTextColor: appmode.txtcolor[mode][1],
                textDisabledColor: appmode.txtcolor[mode][2],
                monthTextColor: appmode.txtcolor[mode][1],
                textDayFontFamily: 'Poppins-Light',
                textMonthFontFamily: 'Poppins-Medium',
                textDayHeaderFontFamily: 'Poppins-Light',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: '#ef4444' },
              ]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>BATAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  container: {
    height: height * 0.6,
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
  calendarContainer: {
    flex: 1,
    padding: 12,
  },
  buttonContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
  },
});