import appmode from '@/src/helpers/ThemesMode';
import { useAppSelector } from '@/src/redux/hooks';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import moment from 'moment';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
moment.locale('ID');

export default function CardTimesheet({ item, onPress }) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  const { user } = useAppSelector(state => state.auth);

  // Add safety checks for item
  if (!item) {
    return null;
  }

  const calculateHours = (start, end) => {
    if (!start || !end) return '0.00';
    
    try {
      const startTime = moment(start);
      const endTime = moment(end);
      const duration = moment.duration(endTime.diff(startTime));
      const totalMinutes = duration.asMinutes();
      return (totalMinutes / 60).toFixed(2);
    } catch (error) {
      return '0.00';
    }
  };

  const totalJam = calculateHours(item.starttime, item.endtime);

  // Equipment image based on user type
  const getEquipmentImage = () => {
    return user?.usertype === 'driver' 
      ? require('@/assets/images/dumptruck.png') 
      : require('@/assets/images/excavator.png');
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      A: { label: 'Approved', color: '#10B981' },
      W: { label: 'Waiting', color: '#F59E0B' },
      R: { label: 'Retry', color: '#EF4444' },
      approved: { label: 'Approved', color: '#10B981' },
      pending: { label: 'Waiting', color: '#F59E0B' },
      rejected: { label: 'Retry', color: '#EF4444' },
      draft: { label: 'Draft', color: '#6B7280' },
    };
    return statusMap[status] || { label: 'Unknown', color: '#6B7280' };
  };

  const statusInfo = getStatusInfo(item.status);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#374151' : '#FFFFFF',
          borderBottomColor: appmode.boxlinecolor[mode][2],
          borderColor: appmode.boxlinecolor[mode][1],
        },
      ]}
      onPress={onPress}
    >
      {/* Header with date and ID */}
      <View style={styles.header}>
        <Text
          style={[
            styles.dateText,
            { color: appmode.txtcolor[mode][1] },
          ]}>
          {moment(item.date_ops || item.tanggal || new Date()).format('dddd, DD MMM YYYY')}
        </Text>
        <Text style={[styles.idText, { color: appmode.txtcolor[mode][2] }]}>
          #{item.id || 'N/A'}
        </Text>
      </View>

      {/* Customer name */}
      <Text
        style={[
          styles.customerText,
          { color: appmode.txtcolor[mode][1] },
        ]}>
        {item.pelanggan?.nama || item.penyewa?.nama || item.customer || '-'}
      </Text>

      {/* Main content row */}
      <View style={styles.mainRow}>
        {/* Left section - Operator and time details */}
        <View style={styles.leftSection}>
          <Text
            style={[
              styles.operatorName,
              { color: isDark ? '#F59E0B' : '#EAB308' },
            ]}>
            {item.karyawan?.nama?.length > 10 
              ? `${item.karyawan.nama.substring(0, 10)}...` 
              : item.karyawan.nama}
          </Text>
          
          {/* Time details */}
          <View style={styles.timeDetails}>
            <View style={styles.timeRow}>
              <Text style={[styles.timeLabel, { color: appmode.txtcolor[mode][6] }]}>
                Start
              </Text>
              <Text style={[styles.timeValue, { color: appmode.txtcolor[mode][3] }]}>
                : {moment(item.starttime).format('ddd, HH:mm')}
              </Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={[styles.timeLabel, { color: appmode.txtcolor[mode][4] }]}>
                Finish
              </Text>
              <Text style={[styles.timeValue, { color: appmode.txtcolor[mode][3] }]}>
                : {moment(item.endtime).format('ddd, HH:mm')}
              </Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={[styles.timeLabel, { color: appmode.txtcolor[mode][1], fontWeight: '600' }]}>
                Total
              </Text>
              <Text style={[styles.timeValue, { color: appmode.txtcolor[mode][1], fontWeight: '600' }]}>
                : {totalJam} Jam
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: appmode.boxlinecolor[mode][2] }]} />

        {/* Right section - Equipment details */}
        <View style={styles.rightSection}>
          <View style={styles.equipmentRow}>
            <View style={styles.equipmentInfo}>
              <Text
                style={[
                  styles.equipmentCode,
                  { color: appmode.txtcolor[mode][1] },
                ]}>
                {item.equip_kode || item.equipment?.kode || '--'}
              </Text>
              <Text
                style={[
                  styles.equipmentModel,
                  { color: appmode.txtcolor[mode][5] },
                ]}>
                {item.equipment?.model || ''}
              </Text>
              <Text
                style={[
                  styles.equipmentIdentity,
                  { color: appmode.txtcolor[mode][2] },
                ]}>
                {item.equipment?.identity || ''}
              </Text>
            </View>
            <View style={styles.equipmentImageContainer}>
              <Image
                source={getEquipmentImage()}
                style={styles.equipmentImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* SMU meters */}
          <View style={styles.smuRow}>
            <View style={styles.smuItem}>
              <MaterialCommunityIcons
                name="speedometer-slow"
                size={14}
                color={appmode.txtcolor[mode][6]}
              />
              <Text style={[styles.smuValue, { color: appmode.txtcolor[mode][1] }]}>
                {item.smustart}
              </Text>
            </View>
            <View style={styles.smuItem}>
              <MaterialCommunityIcons
                name="speedometer"
                size={14}
                color={appmode.txtcolor[mode][4]}
              />
              <Text style={[styles.smuValue, { color: appmode.txtcolor[mode][1] }]}>
                {item.smufinish}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom info section */}
      <View style={[
        styles.bottomSection,
        { 
          borderColor: appmode.boxlinecolor[mode][2],
          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
        },
      ]}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="alarm"
              size={20}
              color={appmode.txtcolor[mode][1]}
            />
            <Text style={[styles.infoText, { color: appmode.txtcolor[mode][1] }]}>
              {item.shift?.nama || '-'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="file-document-edit"
              size={20}
              color={appmode.txtcolor[mode][1]}
            />
            <Text style={[styles.infoText, { color: appmode.txtcolor[mode][1] }]}>
              {item.ls || 'STD'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="gas-station"
              size={20}
              color={appmode.txtcolor[mode][1]}
            />
            <Text style={[styles.infoText, { color: appmode.txtcolor[mode][1] }]}>
              {item.bbm} Lt
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Octicons
              name="tools"
              size={20}
              color={appmode.txtcolor[mode][1]}
            />
            <Text style={[styles.infoText, { color: appmode.txtcolor[mode][1] }]}>
              {item.equipment_tool || 'Bucket'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer with description and status */}
      <View style={styles.footer}>
        <Text
          style={[
            styles.description,
            { 
              color: item.keterangan ? appmode.txtcolor[mode][4] : appmode.txtcolor[mode][1],
              flex: 1,
            },
          ]}>
          {item.keterangan || 'Tdk ada keterangan...'}
        </Text>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: statusInfo.color,
          },
        ]}>
          <Text style={styles.statusText}>
            {statusInfo.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 3,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  idText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  customerText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '300',
    marginBottom: 8,
  },
  mainRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  leftSection: {
    flex: 2,
  },
  operatorName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '400',
    marginBottom: 4,
  },
  timeDetails: {
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 2,
  },
  timeLabel: {
    flex: 1,
    fontFamily: 'Abel-Regular',
    fontSize: 12,
  },
  timeValue: {
    flex: 2,
    fontFamily: 'Abel-Regular',
    fontSize: 12,
  },
  divider: {
    width: 1,
    marginHorizontal: 8,
  },
  rightSection: {
    flex: 3,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentCode: {
    fontSize: 18,
    fontFamily: 'Dosis-SemiBold',
    fontWeight: '600',
    lineHeight: 18,
  },
  equipmentModel: {
    fontSize: 10,
    fontFamily: 'Dosis-SemiBold',
    lineHeight: 16,
  },
  equipmentIdentity: {
    fontSize: 10,
    fontFamily: 'Dosis-SemiBold',
    lineHeight: 16,
  },
  equipmentImageContainer: {
    minWidth: 40,
  },
  equipmentImage: {
    height: 60,
    width: 90,
  },
  smuRow: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smuValue: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomSection: {
    flexDirection: 'row',
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '400',
    marginVertical: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Roboto-Medium',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});