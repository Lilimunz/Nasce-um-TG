import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputCustomizadoProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export function InputCustomizado({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  style, // Avisamos o componente que ele pode receber um style de fora
  ...rest
}: InputCustomizadoProps) {
  return (
    <TextInput
      // Aqui combinamos o estilo do componente com o que vier de fora
      style={[styles.input, style]}
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
});