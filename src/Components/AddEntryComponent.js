import React, { useEffect, useState } from 'react';
import {Text, FlatList, View, StyleSheet, Modal, Alert, Image} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements';
import { FieldItem, AddButton, PhotoButton, EditButton } from '../componentIndex';
import { launchCamera,launchImageLibrary } from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { getApp } from 'firebase/app';
import {doc, setDoc, collection, getFirestore, } from "firebase/firestore";
import { getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';

const app = getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);

const AddEntryComponent = ({fireAuth, modalVisibility, toggleModalVisibility, createDocument}) => {
  const [entryFields, setEntryFields] = useState([]);
  const [entryName, setEntryName] = useState();
 
  const [image, setImage] = useState();

  const handleCloseModal = () => {
    setEntryFields([]);
    setEntryName();
    setImage();
    toggleModalVisibility();
  }

  const runMethod = async () => {
    
    const entry = {
        entry_name: entryName,
        entry_fields: entryFields,
        hasImage: false,
        
    };
    
    await createDocument(entry, image);
   
  };

  const handleAddField = () => {
    const fields = [...entryFields];
    fields.push(
      {fieldName: "", fieldValue: ""}
    );
    setEntryFields(fields);
    
  }

  const handleRemoveField = (index) => {
    const fields = [...entryFields];
    fields.splice(index, 1);
    setEntryFields(fields);
  }

  const handleInputChange = (index, value, target) => {
    const fields = [...entryFields];
    const updatedField = target;
    fields[index][updatedField] = value;

    setEntryFields(fields);
    
  };

  const handleAdd = () => {
    runMethod().then(
      handleCloseModal()
    )
    .catch((error) => {console.log(error)});
    
  }

  const renderItem = (field, index) => {

    let name = null;
    let value = null;

    Object.keys(field).map((key) => {
      if(key === 'fieldName') {
        name = field[key]; 
      }
      if(key === 'fieldValue') {
        value = field[key];
      }
    })
    
    return(
    <View style={{marginBottom: 15}}>
      <FieldItem 
        itemIndex={index} 
        title={name} 
        itemValue={value} 
        onDelete={handleRemoveField} 
        onTextChange={handleInputChange} 
      />
    </View>);
    
  };

  const addPhotos = () => {
    Alert.alert("Options",null,  
            [
                {
                  text: "Select Photo From Camera Roll",
                  onPress: selectPhoto
                },
                {
                  text: "Take Photo",
                  onPress: takePhoto,
                },
                { 
                  text: "Cancel", 
                  style: 'destructive'
                }
            ]
        );
  }

  const takePhoto = () => {
    Alert.alert("Feature not released yet",null,  
            [
                { 
                  text: "Ok", 
                  style: 'cancel'
                }
            ]
        );
  }

  const selectPhoto = async () => {
    
    ImageCropPicker.openPicker({
      multiple: false,
      includeBase64: true,
      forceJpg: true,
      compressImageQuality: 0.1
    }).then((image) => {
      setImage(image)
    })
  
  }

  return (
    <Modal animationType="slide" visible={modalVisibility} presentationStyle={'pageSheet'}>
          
    <>
      <View style={{backgroundColor: "#f2f2f2", flex:1}}>
          <View style={{flexDirection:'row', justifyContent:"space-between", alignItems:"center", width: '100%', backgroundColor: "#FFFFFF", borderBottomColor: "#ababab", borderBottomWidth: 0.15}}>
              <Button 
                  style={{ marginHorizontal: 10, marginVertical: 6, marginLeft: 10}} 
                  icon={
                      <Icon 
                          name='chevron-left' 
                          type='font-awesome'
                      />
                  } 
                  onPress={handleCloseModal} 
                  type="clear"
              />
              <Text style={{fontSize: 18, fontWeight: "600"}}>Add Entry</Text>
              <Button 
                  style={{marginHorizontal: 10, marginVertical: 6, marginLeft: 10}} 
                  icon={
                      <Icon 
                          name='check' 
                          type='font-awesome'
                      />
                  } 
                  onPress={handleAdd} 
                  type="clear"
              />
          </View>
      

          

          <View style={{margin: 10}}>
          {image != null ?
              <>
                <View style={{flexDirection: "row", justifyContent: "center", marginBottom: 10}} >
                  <View style={{alignSelf:"center", width: 200, height: 150, borderWidth: 8, borderRadius: 10, borderColor: "#FFFFFF", alignContent: "center", shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.2,}}>
                    <Image style={{width: "100%", height: "100%",}} source={{uri: `data:${image.mime};base64,${image.data}`}} />
                  </View>
                  <View style={{marginLeft: 10,width: 50, height: 50, backgroundColor: "#FFFFFF",justifyContent: 'center', alignSelf:"center",lalignContent: "center", marginBottom: 10}} borderRadius={100}>
                    
                      <Button 
                          icon={{
                              name: 'pencil',
                              type: 'foundation',
                              color: 'black',
                              style: {opacity: 0.2},
                              size: 25,
                              
                          }} 
                          containerStyle={{
                              alignSelf: "center"
                          }} 
                          type="clear"
                          onPress={addPhotos}
                      />
                        
                    </View>
                </View>
                
              </>
              :
              <>
              <PhotoButton onPress={addPhotos} />
              </>
            }

            <View style={{alignContent: "center"}}>
        
              {entryFields ?
              <FlatList 
                data={entryFields}
                renderItem={({item, index}) => (renderItem(item, index))}
                keyExtractor={(item, index) => index}
                ListHeaderComponent={<Input 
                  containerStyle={styles.inputContainer}
                  inputContainerStyle={styles.innerInputContainer}
                  placeholder='Entry Name' 
                  //leftIcon={{type: 'entypo', name: 'mail'}}
                  onChangeText={(text) => {
                    setEntryName(text);
                  }}
                />}
                ListFooterComponent={<AddButton handlePress={handleAddField}/>}
              />
              : 
              <Text>hi</Text>
              }
              
             
              </View>
          </View>
      </View>
 
   

    </>
 </Modal>
  );
};
  
const styles = StyleSheet.create({
    inputContainer: {
    margin: 5,
    width: 350,
    alignSelf: 'center',
    },

    innerInputContainer:{
    borderRadius:0, 
    borderWidth: 0, 
    borderBottomWidth:0, 
    borderColor:"#000", 
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    shadowOpacity: 0.2,
    },

    buttonContainer: {
    margin: 0,
    borderRadius: 0,
    padding: 5, 
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    shadowOpacity: 0.2,
    },

    innerButtonContainer: {
    alignSelf: 'center',
    width: 200,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor:"#FFFFFF",
    },
});

export default AddEntryComponent;