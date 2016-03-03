# react-three-ui
##### Note: this is very much experimental in its current state and performance is bad to say the least.
React Three UI is an exploration into the creation of React UIs in 3D space.

### Wait, what?
First off, an explanation: Typically you'd just want to add a React UI on top of canvas as a separate layer in the DOM. The goal of react-three-ui is to provide functionality for building UIs *in 3D space* using plain old React. The majority of the heavy lifting here is done by [React Three](https://github.com/Izzimach/react-three). This may prove to be an important design feature for future virtual reality applications.

### What does this library provide?
There are a few components which can be combined to build UIs: The main component is `UI` -- it's what you put in your React Three Scene. UI can only have a single child. UIs can have "pointers" which is basically a simplified interface for creating ray casters. UI will allow you to define a callback for a pointer which will be notified when an intersection occurs. UI contains a structure compose of `Layer`, `Image`, and `Text` elements. Layers are like `div`s in HTML. An Image is a type of Layer, but Text is not. Layers can go inside Images, and vice versa. Text can only contain strings -- nesting Text tags is not currently supported. This library supports both animation and flexbox styling via [facebook/css-layout](https://github.com/facebook/css-layout).

##### API documentation coming soon.
