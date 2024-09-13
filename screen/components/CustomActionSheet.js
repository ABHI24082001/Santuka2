import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

const CustomActionSheet = ({visible, onClose, options, onOptionSelect}) => {
  const translateY = useRef(new Animated.Value(300)).current; // Initial position (off-screen)

  useEffect(() => {
    if (visible) {
      // Slide in animation when visible is true
      Animated.timing(translateY, {
        toValue: 0, // Move to visible position
        duration: 300, // Animation duration in ms
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out animation when visible is false
      Animated.timing(translateY, {
        toValue: 300, // Move it off-screen again
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Slide out animation before calling the onClose
    Animated.timing(translateY, {
      toValue: 300, // Move it off-screen
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Callback after animation completes
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[styles.actionSheetContainer, {transform: [{translateY}]}]}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => {
              onOptionSelect(option);
              handleClose();
            }}>
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={handleClose}>
          <Image
            source={require('../../cross-button.png')}
            style={styles.flashImage}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  actionSheetContainer: {
    backgroundColor: 'white',
    padding: 80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  flashImage: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 180,
    right: -50,
  },
  option: {
    padding: 15,
  },
  optionText: {
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
});

export default CustomActionSheet;
