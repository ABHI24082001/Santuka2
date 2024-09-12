import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const CustomDropdown = ({
  hasBorder,
  labelText,
  dropData,
  isend = false,
  placeholdername,
  value,
  onChangeText,
  editOnPress,
  isEdit = false,
  showSearch = true,
  isMandatory = true,
  onSelect,
}) => {
  const [showDropdown, setShowDropdown] = useState(false); // Manage dropdown visibility

  const handleSelect = item => {
    if (onSelect && typeof onSelect === 'function') {
      onSelect(item.value);
    }
    setShowDropdown(false); // Hide dropdown after selection
  };

  const handleInputChange = text => {
    onChangeText(text); 
    setShowDropdown(text.length > 0); 
  };

  

  const renderDropdownItem = ({item}) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelect(item)}>
      <Text style={styles.dropdownItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Text
        style={{
          alignItems: 'flex-start',
          padding: 5,
          marginLeft: '1%',
          color: 'black',
          fontSize: 15,
          fontFamily: 'bold',
        }}>
        {labelText} {isMandatory && <Text style={{color: 'red'}}>*</Text>}
      </Text>
      <View
        style={{
          height: 40,
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          borderColor: 'black',
          borderRadius: 9,
          alignSelf: 'center',
          marginBottom: isend ? 20 : 5,
        }}>
        <TextInput
          style={[
            styles.input,
            {
              width: isEdit ? '90%' : '100%',
              borderWidth: hasBorder ? 1 : 1,
              borderColor: hasBorder ? 'red' : '#000',
            },
          ]}
          placeholder={placeholdername}
          placeholderTextColor="#000"
          value={value}
          onChangeText={handleInputChange} // Handle input changes
        />
        {isEdit && (
          <TouchableOpacity
            style={{
              width: '30%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={editOnPress}>
            <Image
              style={{height: '90%', width: '90%', tintColor: '#2596be'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Conditionally render the FlatList */}
      {showDropdown &&
        showSearch &&
        (dropData.length > 0 ? (
          <FlatList
            data={dropData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderDropdownItem}
            style={styles.dropdownList}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        ))}
    </>
  );
};

const styles = StyleSheet.create({
  dropdownList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc', // Changed to visible color
  },
  dropdownItemText: {
    fontSize: 15,
    color: 'black',
  },
  input: {
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 2,
    color: 'black',
  },
  noDataContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'gray',
    fontSize: 15,
  },
});

export default CustomDropdown;
