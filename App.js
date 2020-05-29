import React, {useState, useEffect } from 'react';
import {  Platform,StyleSheet, Text, View,Image } from 'react-native';
import MapView, { Marker } from "react-native-maps";
import mapStyle from "./styles/mapStyle.json"
import Constants from "expo-constants";
import * as Location from "expo-location";
import { Icon } from "react-native-elements";
import metroJson from "./json/metro.json"
import axios from "axios";
import { VictoryPie } from "victory-native";

const dataColor = ["#5A5AAD", "#A3D1D1"];
const UBIKE_URL =
  "https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json/preview";

const  App= () => {
  const [region,setRegion] = useState({
    longitude:121.452465,
    latitude:25.036171,
    longitudeDelta: 0.01,
    latitudeDelta: 0.02,
  });
  const [marker, setMarker] = useState({
    coord: {
      longitude: 121.452465,
      latitude: 25.036171,
    },
    name: "新莊捷運站",
    address: "快來玩",
  });
  const [onCurrentLocation, setOnCurrentLocation] = useState(false);
  const [metro, setMetro] = useState(metroJson);
  const [ubike, setUbike] = useState([]);

  const onRegionChangeComplete = (rgn) => {
    if (
      Math.abs(rgn.latitude - region.latitude) > 0.0002 ||
      Math.abs(rgn.longitude - region.longitude) > 0.0002
    ) {
      setRegion(rgn);
      setOnCurrentLocation(false);
    }
  };
  const getUbikeAsync = async () => {
    let response = await axios.get(UBIKE_URL);
    setUbike(response.data);
  };

  const setRegionAndMarker = (location) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      ...marker,
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setRegionAndMarker(location);
    setOnCurrentLocation(true);
  };

  useEffect(() => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      setErrorMsg(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
    } else {
      getLocation();
      getUbikeAsync();
    }
  }, []);
  return (
    <View style={{flex:1}}>
      <MapView
        region={region}
        style={{ flex: 1 }}
       
        customMapStyle={mapStyle}
        onRegionChangeComplete={onRegionChangeComplete}
      >
    {metro.map((site) => (
      <Marker
          coordinate={{ latitude: site.latitude, longitude: site.longitude }}
          key={`${site.id}${site.line}`}
          title={site.name}
          description={site.address}
        >
           <Image style={styles.ring} source={{uri:"https://event.welcometw.com/giftbag/ddcdiscount/img/icon_metro.png"}} />
           </Marker>
    ))}
     {ubike.map((site) => (
          <Marker
            coordinate={{
              latitude: Number(site.lat),
              longitude: Number(site.lng),
            }}
            key={site.sno}
            title={`${site.sna} ${site.sbi}/${site.tot}`}
            description={site.ar}
          >
            <VictoryPie
            radius={17}
            data={[
              {x:site.tot-site.sbi,y:100-(site.sbi/site.tot)*100},
              //全部減借走就是剩的車子   圓餅100%-減被借走車輛所佔的百分比
              {x:site.sbi,y:(site.sbi/site.tot)*100},
              //被借走的
            ]}
            colorScale={dataColor}
            innerRadius={7}
            labelRadius={10}
            />
            </Marker>
        ))}
      </MapView>

      {!onCurrentLocation && (
        <Icon
          raised
          name="ios-locate"
          type="ionicon"
          color="black"
          containerStyle={{
            backgroundColor: "#517fa4",
            position: "absolute",
            right: 20,
            bottom: 40,
          }}
          onPress={getLocation}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  ring: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "#4169E1",
    borderWidth: 3,
    borderColor: "#003399",
  },
  ring2: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "rgba(230,230,250, 0.8)",
    borderWidth: 3,
    borderColor: "#003399",
  },
});

 export default App;