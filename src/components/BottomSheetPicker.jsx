import appmode from '@/src/helpers/ThemesMode';
import { useAppSelector } from '@/src/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function BottomSheetPicker({
  visible,
  title,
  data,
  onSelect,
  onClose,
  displayKey = 'nama',
  searchKey = 'nama',
  renderItem,
  ListEmptyComponent,
  enableSourceSwitch = false,
  sourceMode = 'online',
  onChangeSource,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  const [keyword, setKeyword] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    // Only update when modal opens (visible changes from false to true)
    if (visible && !prevVisibleRef.current) {
      setFilteredData(data || []);
      setKeyword('');
    }
    prevVisibleRef.current = visible;
  }, [visible]);

  const handleSearch = (text) => {
    setKeyword(text);
    if (text) {
      const filtered = (data || []).filter((item) =>
        item[searchKey]?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data || []);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    setKeyword('');
    onClose();
  };

  const defaultRenderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        {
          backgroundColor: isDark ? '#374151' : '#FFFFFF',
          borderColor: appmode.boxlinecolor[mode][1],
        },
      ]}
      onPress={() => handleSelect(item)}>
      <Text
        style={[
          styles.listItemText,
          { color: appmode.txtcolor[mode][1] },
        ]}>
        {item[displayKey] || '-'}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={appmode.txtcolor[mode][2]}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
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
          {/* Header */}
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
            {enableSourceSwitch && (
              <TouchableOpacity
                onPress={() => onChangeSource && onChangeSource(sourceMode === 'online' ? 'offline' : 'online')}
                style={styles.sourceSwitch}
              >
                <Ionicons
                  name={sourceMode === 'online' ? 'cloud-outline' : 'server-outline'}
                  size={20}
                  color={appmode.txtcolor[mode][1]}
                />
                <Text style={[styles.sourceText, { color: appmode.txtcolor[mode][1] }]}>
                  {sourceMode === 'online' ? 'Online' : 'Offline'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={appmode.txtcolor[mode][1]}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  borderColor: appmode.boxlinecolor[mode][1],
                },
              ]}>
              <Ionicons
                name="search"
                size={20}
                color={appmode.txtcolor[mode][2]}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: appmode.txtcolor[mode][1] },
                ]}
                placeholder="Cari..."
                placeholderTextColor={appmode.txtcolor[mode][2]}
                value={keyword}
                onChangeText={handleSearch}
              />
              {keyword ? (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={appmode.txtcolor[mode][2]}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filteredData}
            renderItem={renderItem || defaultRenderItem}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={ListEmptyComponent || (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={appmode.txtcolor[mode][2]}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: appmode.txtcolor[mode][2] },
                  ]}>
                  Tidak ada data ditemukan
                </Text>
              </View>
            )}
          />

          {/* Cancel Button */}
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
    height: height * 0.8,
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
  sourceSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  sourceText: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Light',
    padding: 0,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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