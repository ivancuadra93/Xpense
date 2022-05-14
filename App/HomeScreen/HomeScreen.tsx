import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react"
import { Text, useColorScheme, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { StackParamsList } from '../Types';

type Props = NativeStackScreenProps<StackParamsList, "HomeScreen">

const HomeScreen: React.FC<Props> = ({navigation, route}) => {
    const isDarkMode = useColorScheme() === 'dark';
    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", ...backgroundStyle}}>
      <Text>
        {route.params.welcomeMessage}
      </Text>
    </View>
    )
}

export default HomeScreen