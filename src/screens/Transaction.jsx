import React, { useState } from "react";
import { View, Image, Text, Dimensions, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import MaterialTabs from 'react-native-material-tabs';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import logo from '../assests/logo.png';
import History from '../screens/History';
import Today from "./Today";
import Customer from './Customer';


const { width } = Dimensions.get('window');

export default function Transaction(props) {
    const [selectedTab, setSelectedTab] = useState(0);
    const tabCount = 3;
    const tabWidth = width / tabCount;
    const renderIndicator = () => {
        return (
            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={['#e41e11', '#eb5f18', '#f0901f']}
                style={[
                    styles.gradientIndicator,
                    { left: selectedTab * tabWidth, width: tabWidth },
                ]} />
        )
    };

    return (
        <SafeAreaView style={styles.background}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} style={styles.linearEnd}>
                <TouchableOpacity style={styles.flex1} onPress={() => props.navigation.goBack()}>
                    <AntDesign name='arrowleft' size={30} color="white" />
                </TouchableOpacity>
                <View style={styles.flex7}>
                    <Text style={styles.trans}>Transaction</Text>
                </View>
                <View style={styles.flex2}>
                    <View style={styles.imageView}>
                        <Image source={logo} style={styles.imageStyle} />
                    </View>
                </View>
            </LinearGradient>
            <View>
                <MaterialTabs
                    items={['Today', 'History', 'Customer']}
                    selectedIndex={selectedTab}
                    onChange={(index) => {
                        setSelectedTab(index)
                    }
                    }
                    barColor="white"
                    activeTextColor="black"
                    inactiveTextColor="red"
                    textStyle={styles.tabText}
                />
                {renderIndicator()}
            </View>
            {selectedTab === 0 ?
                    <Today name={'Today'} /> : null}


            {selectedTab === 1 ?
                <History name={'History'} />
                : null}
            {selectedTab === 2 ?
                <Customer name={'Customer'} />
                : null}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    tabText: {
        fontSize: 16,
    },
    gradientIndicator: {
        height: 4, // Adjust the height according to your needs
        borderRadius: 2, // Optional: to make the ends rounded
    },
    background: { flex: 1, backgroundColor: 'white' },
    linearEnd: { height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
    imageStyle: { height: 45, width: 45, objectFit: 'contain', alignSelf: 'center' },
    imageView: { height: 50, width: 50, borderRadius: 50, backgroundColor: 'white' },
    trans: { color: 'white', fontSize: 15, fontWeight: '600' },
    flex1: { flex: 0.1 },
    flex7: { flex: 0.7 },
    flex2: { flex: 0.2, alignItems: 'flex-end' },
    from: { color: 'black', fontSize: 14, fontWeight: '600', flex: 0.4 },
    colon: { color: 'black', fontSize: 18, fontWeight: '600', flex: 0.1 },
    calender: { borderWidth: 1, borderColor: '#e6e6e6', flexDirection: 'row', alignItems: 'center', padding: 10, flex: 0.5, justifyContent: 'space-between' },
    searchPdf: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 15 },
    search: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 10, borderRadius: 10 }

});
