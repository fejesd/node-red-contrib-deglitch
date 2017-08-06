/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 
module.exports = function(RED) {

    debugmode = false;   
    
    function Deglitch(config) {        
        RED.nodes.createNode(this,config);
        var node = this;
        this.mode = config.mode||1;
        this.time = config.time||5;
        this.timeUnits = config.timeUnits||"seconds";
        if (this.timeUnits == 'milliseconds') this.time *= 0.001;
        else if (this.timeUnits == 'minutes') this.time *= 60;
        else if (this.timeUnits == 'hours') this.time *= 60*60;

        var topics = {};

        this.on('input', function(msg) {
            var payload = JSON.stringify(msg.payload);
            var topic = '';
            if (node.mode == 1) {
                if ('topic' in msg)
                    topic = msg.topic;
                else
                    topic = 'defaulttopic';
                if (topic == '') topic = 'emptytopic';
            } else {
                topic = 'dontcare';
            }

            if (!(topic in topics)) {                       // on first message, just pass immediately                
                topics[topic] = {"value": payload, "message":msg, "timer":null};
                node.send(msg);
                if (debugmode) node.error('first message');
            } else if (topics[topic].timer != null) {     // timer active                
                if (debugmode) node.error('timer is active');
                if (payload == topics[topic].value) {         // the value has just returned to the original
                    if (debugmode) node.error('  ..shut down');
                    clearTimeout(topics[topic].timer);           //so shut down the timer
                    topics[topic].timer = null;                     
                } else {                                        // the new value is not the original..                    
                    topics[topic].newmessage = msg;
                }
            } else {                                        // timer is inactive, this is a new event                
                if (payload == topics[topic].value)             //dismiss same message
                    return;
                topics[topic].newmessage = msg;
                if (debugmode) node.error('start timer');
                topics[topic].timer = setTimeout(function(){
                    if (debugmode) node.error('timeout');
                    node.send(topics[topic].newmessage);
                    topics[topic].message = topics[topic].newmessage;
                    topics[topic].value = JSON.stringify(topics[topic].message.payload);
                    topics[topic].newmessage = undefined;
                    topics[topic].timer = null;
                }, node.time*1000);
            }
        });        
    }
    RED.nodes.registerType("deglitch",Deglitch);
};
