import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

const CustomDropdown = ({
  hasBorder,
  labelText,
  dropData,
  isend = false,
  placeholdername,
  searchPlaceholdername,
  value,
  onChange = () => {}, // Default empty function
  onChangeText,
  editOnPress,
  isEdit = false,
  showSearch = true,
  isMandatory = true,
  dropdownPosition,
  onSearchTextChange,
  searchText,
}) => {
  return (
    <>
      <Text
        style={{
          alignItems: 'flex-start',
          padding: 5,
          marginLeft: '5%',
          color: 'black',
          fontSize: 13,
          fontFamily: 'PoppinsMedium',
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
        <Dropdown
          style={[
            styles.dropdown,
            {
              width: isEdit ? '90%' : '100%',
              borderWidth: hasBorder ? 0.9 : 0,
              borderColor: hasBorder ? 'red' : 'transparent',
            },
          ]}
          placeholderStyle={{fontSize: 15, color: '#6c6f73'}}
          selectedTextStyle={{fontSize: 15, color: '#6c6f73'}}
          inputSearchStyle={{
            height: 40,
            fontSize: 15,
            color: '#6c6f73',
          }}
          itemTextStyle={{color: 'black'}}
          data={dropData}
          search={showSearch}
          maxHeight={'60%'}
          labelField="label"
          valueField="value"
          placeholder={placeholdername}
          searchPlaceholder={searchPlaceholdername}
          value={value}
          onChange={onChange}
          onChangeText={onChangeText}
          dropdownPosition={dropdownPosition}
          onSearchTextChange={onSearchTextChange}
          searchText={searchText}
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
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    borderColor: 'black',
    borderRadius: 8,
    alignSelf: 'center',
    backgroundColor: '#D2F3FD',
    paddingHorizontal: 15,
  },
});

export default CustomDropdown;
