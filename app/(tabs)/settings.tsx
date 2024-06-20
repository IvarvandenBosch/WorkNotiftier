import React from "react";
import { Text, View, StyleSheet, TextInput, Button } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";

async function save(key: any, value: any) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key: any) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    alert("🔐 Here's your value 🔐 \n" + result);
  } else {
    alert("No values stored under that key.");
  }
}

export default function settings() {
  const [value, onChangeValue] = useState("");
  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>Enter your l1nda link</Text>
      <TextInput
        style={styles.textInput}
        onSubmitEditing={(event) => {
          save("l1ndaLink", event.nativeEvent.text);
        }}
        placeholder="Enter your l1nda link"
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 10,
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  paragraph: {
    marginTop: 34,
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    height: 35,
    borderColor: "gray",
    borderWidth: 0.5,
    padding: 4,
  },
});
