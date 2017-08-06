# Deglitch filter node for Node-RED

## Introduction

Real world sensors and inputs may be imperfect some time. They may have some spurious short invalid data which needs to be filtered out before processing. This node helps removing the unwanted signal transitions from the flow by filtering it based on payload data. 

A very simple example: real-world buttons and on-off switches are bouncing during the transition, creating extra on-off events in the flow. These short glitches have to be removed and this node is intended to do this. Of course, not just boolean payloads are supported but you can have any kind of object and multiple values.

The node will filter the different topics independently of eachother, however this behaviour can be changed by config.

## Behaviour

For further explanation, see the picture below:

![event flow](images/flow1.png?raw=true "event flow")

- The first message is passed immediately.
- The second message (B) is delayed by the specified timeout before emitting to the output. 
- The third message (A) is dismissed because of a message with same content as previous message has arrived within timeout.
- The fifth message (B) is also dismissed, because the content is same as before.
- When timeout has been passed after (C), an (E) is emitted because this was the last message within the timeout period. (D) and (E) are omitted.

For further reference, please see the explanation of debounce pattern [here](http://reactivex.io/documentation/operators/debounce.html).

## Configuration

![screenshoot](images/config.png?raw=true "config")

