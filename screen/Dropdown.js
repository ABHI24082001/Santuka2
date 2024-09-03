import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';

const Dropdown = ({data, placeholder, onSelect}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelect = item => {
    setSelectedItem(item);
    setIsOpen(false);
    onSelect && onSelect(item);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={styles.dropdownButton}>
        <Text style={styles.dropdownButtonText}>
          {selectedItem ? selectedItem : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        />
        <View style={styles.dropdownList}>
          <FlatList
            data={data}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#f8f8f8',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownList: {
    maxHeight: '80%',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Dropdown;
