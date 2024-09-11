# Vertex Manager
The ```VertexManager``` class is responsible for managing the vertices of a [CustomShape](./custom_shape.md). It stores vertices in a map which provides the ability for selecting and manipulating vertices.

A ```VertexManager``` is typically created for a group of vertices that belong to a shape, but can be used independently.

## Usage
To create a new instance of ```VertexManager```
```javascript
const vertexManager = new VertexManager("shapeGroupID");
```
The constructor takes a ```groupID``` as its argument, which is used to identify the group of vertices that the manger will handle.

## Attributes
### vertexMap
This is a ```Map``` where the keys are unique vertex IDs (numbers), and the values are ```THREE.Vector3``` objects representing the vertices' positions.

### selectedVertices
An array that stores the IDs of any currently selected vertices.

### id
A numeric counter used to generate unique IDs for each vertex added to the [vertexMap](#vertexmap).

### groupID
A string that identifies the group of vertices managed by the instance.