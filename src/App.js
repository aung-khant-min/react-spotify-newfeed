
import React from 'react';

//axios
import axios from 'axios';

//infinite scroll
import InfiniteScroll from 'react-infinite-scroll-component';

//material-ui 
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Grid from '@material-ui/core/Grid';


// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce((initial, item) => {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

window.location.hash = "";

//Auth link
var cid = process.env.REACT_APP_CLIENT_ID;
var uri = process.env.REACT_APP_CALLBACK_URI;
var spotifyAuth = `https://accounts.spotify.com/authorize?client_id=${cid}&redirect_uri=${uri}&scope=user-read-currently-playing&response_type=token&show_dialog=true`;

//First Appearence
const Login = props => (
  <div className="login">
    <Button variant="outlined" onClick={e => window.location.assign(spotifyAuth)}>LINK YOUR SPOTIFY ACCOUNT FIRST</Button>
  </div>
)

//Nav Bar
const NavBar = props => (
  <div className="navbar">
    <div>
      <Typography variant="h6">
        SpotifyNewFeed
    </Typography>
    </div>
    <div>
      <IconButton aria-label="menu" href="#menu">
        <MenuIcon />
      </IconButton>
    </div>
  </div>
)

//Menu
const Menu = props => (
  <div className="popover" id="menu">
    <div className="content">
      <div className="nav">
        <ul className="nav_list">
          <div className="nav_list_item">
            <li><a href="https://developer.spotify.com/">developer.spotify.com</a></li>
          </div>
          <div className="nav_list_item">
            <li><a href="https://material-ui.com/">material-ui.com</a></li>
          </div>
          <div className="nav_list_item">
            <li><a href="https://fonts.google.com/">fonts.google.com</a></li>
          </div>
          <div className="nav_list_item">
            <a href="#" className="close"></a>
          </div>
        </ul>
      </div>
    </div>
  </div>
)

//Album 
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    marginTop: 10,
    width: '98%',
    margin: 'auto'
  },
  img: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(51, 51, 51)'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: "center"
  },
  title: {
    marginTop: 20
  },
  play: {
    color: '#1DB954',
    marginBottom: 10,
    marginLeft: 'auto',
    marginRight: 'auto'
  }
}));

const Album = props => {

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>

        <Grid item xs={5} >
          <img src={props.image} className={classes.img} />
        </Grid>

        <Grid item xs={7} className={classes.details}>
          <Typography component="h6" variant="h6" className={classes.title}>
            {props.albumName}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {props.albumType} by {props.artist}
          </Typography>
          <Button startIcon={<PlayCircleFilledIcon />} variant="outlined" className={classes.play}
            href={props.openLink}>
            Play
          </Button>
        </Grid>

      </Grid>
    </div>
  )
}


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token: '',
      items: [],
      next: ''
    }
  }

  componentDidMount() {
    // Set token
    let _token = hash.access_token;
    if (_token) {

      this.setState({
        token: _token
      });

      axios.get('https://api.spotify.com/v1/browse/new-releases?limit=7',
        { headers: { 'Authorization': 'Bearer ' + _token } })
        .then(res => {
          console.log(res.data.albums.items)
          this.setState({
            items: res.data.albums.items,
            next: res.data.albums.next
          })
        })
        .catch(err => {
          console.log(err)
        })

    }
  }

  fetchMoreData = () => {
    axios.get(this.state.next, { headers: { 'Authorization': 'Bearer ' + this.state.token } })
      .then(res => {
        this.setState({
          items: this.state.items.concat(res.data.albums.items),
          next: res.data.albums.next
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {

    const { token, items, next } = this.state;

    return (
      token ?
        <div className="container">
          <NavBar />
          <Menu />
          <InfiniteScroll
            dataLength={items.length}
            next={this.fetchMoreData}
            hasMore={true}
            loader={<h5 style={{textAlign:"center"}}>Loading...</h5>}>
            {
              items.map(album =>
                <Album
                  key={album.id}
                  albumName={album.name}
                  image={album.images[0].url}
                  artist={album.artists[0].name}
                  albumType={album.album_type}
                  openLink={album.external_urls.spotify}
                />)
            }
          </InfiniteScroll>
        </div>
        : <Login />
    )
  }

}

export default App;