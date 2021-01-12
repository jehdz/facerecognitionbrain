import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
// import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';



//the api key is specific to my project
const app = new Clarifai.App({
    apiKey: 'bed40e47ee3847d6b04173ee62f2fcfd'
});

// const particleOptions = {
//     'particles': {
//         'number': {
//             'value': 30,
//             'density': {
//                 'enable': true,
//                 'value_area': 150
//             }
//         }
//     }
// }



class App extends Component {
    constructor() {
        super();
        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signin',
            isSignedIn: false
        }
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
        console.log('click');
        app.models
            .predict(
                Clarifai.FACE_DETECT_MODEL,
                this.state.input)
                 //this.calculateFaceLocation(response) returns the box parameter we need to display
                .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
                    // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
                .catch(error => console.log(error));

    }

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState({isSignedIn: false})
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route});
    }
s
render() {
        const { isSignedIn, imageUrl, route, box } = this.state;
    return (
        <div className="App">
            {/*<Particles className="particles"*/}
            {/*    params={particleOptions}*/}
            {/*/>*/}
            <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
            {route === 'home'
                ? <div>
                    <Logo />
                    <Rank/>
                    <ImageLinkForm
                        onInputChange={this.onInputChange}
                        onButtonSubmit={this.onButtonSubmit}
                    />
                    <FaceRecognition box={box} imageUrl={imageUrl}/>
                </div>
                : (
                    route === 'signin'
                    ? <Signin onRouteChange={this.onRouteChange} />
                    : <Register onRouteChange={this.onRouteChange} />
                )

            }
        </div>
    );
}


}

export default App;
