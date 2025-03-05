import {RouteProp} from '@react-navigation/native';
import {MediaItemWithOwner} from 'hybrid-types/DBTypes';
import {Image, ScrollView, StyleSheet, Text} from 'react-native';
import {Video} from 'expo-av';
import {Card, Icon, ListItem} from '@rneui/base';
import {NavigationType} from '../types/LocalTypes'; // Added for typing

const Single = ({route}: {route: RouteProp<NavigationType, 'Single'>}) => {
  const item: MediaItemWithOwner = route.params.item;

  return (
    <ScrollView>
      <Card>
        <Card.Title>{item.title}</Card.Title>

        {item.media_type.includes('image') ? (
          <Image style={styles.image} src={item.filename} />
        ) : (
          <Video
            style={styles.image}
            source={{uri: item.filename}}
            useNativeControls
          />
        )}
        <ListItem>
          <Icon name="today" />
          <Text>{new Date(item.created_at).toLocaleString('fi-FI')}</Text>
        </ListItem>
        {/* <Likes item={item} /> */}
        <ListItem>
          <Text>{item.description}</Text>
        </ListItem>
        <ListItem>
          <Icon name="inventory" />
          <Text>{item.media_type}</Text>
        </ListItem>
        <ListItem>
          <Icon name="person" />
          <Text>{item.username}</Text>
        </ListItem>
        <ListItem>
          <Icon name="image" />
          <Text>{Math.round(item.filesize / 1024)} kB</Text>
        </ListItem>
        {/* <Comments item={item} /> */}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {height: 400},
});

export default Single;
