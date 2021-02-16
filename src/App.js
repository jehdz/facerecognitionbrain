import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import Particles from 'react-particles-js';

import './App.css';




const particleOptions = {
    'particles': {
        'number': {
            'value': 30,
            'density': {
                'enable': true,
                'value_area': 150
            }
        }
    }
}


const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = initialState;
    }

    // componentDidMount() {
    //     fetch('http://localhost:3000/')
    //         .then(response => response.json()) //.json to be able to read the data
    //         .then(console.log) //automatically logs the data
    // }



    loadUser = (data) => {
        this.setState({
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                entries: data.entries,
                joined: data.joined
            }
        })
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputImage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    }

    displayFaceBox = (box) => {
        console.log(box);
        this.setState({box: box});
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value});
    }

    onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input});
            fetch('https://intense-woodland-42293.herokuapp.com/imageurl', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    input: this.state.input
                })
            })
                .then(response => response.json())
                .then(response => {
                    if(response) {
                        fetch('https://intense-woodland-42293.herokuapp.com/image', {
                            method: 'put',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                id: this.state.user.id
                            })
                        })
                            .then(response => response.json())
                            .then(count => {
                                this.setState(Object.assign(this.state.user, { entries: count}))
                            }) //Object.assign allows us to modify objects without resetting the state of the object. The first parameter is the target, the second parameter is what we want to change
                            .catch(console.log)
                    }
                    this.displayFaceBox(this.calculateFaceLocation(response))
                })
                    // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
                .catch(error => console.log(error));

    }

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState)
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route});
    }

render() {
        const { isSignedIn, imageUrl, route, box } = this.state;
    return (
        <div className="App">
            <Particles className="particles"
                params={particleOptions}
            />
            <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
            {route === 'home'
                ? <div>
                    <Logo />
                    <Rank
                        name={this.state.user.name}
                        entries={this.state.user.entries}
                    />
                    <ImageLinkForm
                        onInputChange={this.onInputChange}
                        onButtonSubmit={this.onButtonSubmit}
                    />
                    <FaceRecognition box={box} imageUrl={imageUrl}/>
                </div>
                : (
                    route === 'signin'
                    ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                    : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                )

            }
        </div>
    );
}


}

export default App;
