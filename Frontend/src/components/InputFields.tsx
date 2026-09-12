import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface InputCustomizadoProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  variant?: 'padrao' | 'secundaria'; 
  style?: ViewStyle | ViewStyle[];
}

export function InputCustomizado({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  variant = 'padrao',
  style,
  ...rest
}: InputCustomizadoProps) {
  
  const estiloBase = variant === 'secundaria' ? styles.inputAzul : styles.input;

  return (
    <TextInput
      style={[estiloBase, style]}
      placeholder={placeholder}
      placeholderTextColor="#888"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 55,
    backgroundColor: "#f8f8f8",
    borderRadius: 17,
    paddingLeft: 16,
    color: "#344759",
    fontSize: 16,
    fontFamily: "MuseoModerno-Regular",
    marginBottom: 25, 
    // Sombras do iOS
    shadowOpacity: 0.15, 
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: "#000",
    // Sombra do Android
    elevation: 4, 
  },
    inputAzul: {
    borderWidth: 2,
    borderColor: "#D4E9FF",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Regular",
  },
});