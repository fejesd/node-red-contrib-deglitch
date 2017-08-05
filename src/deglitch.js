module.exports = function(RED) {
    
    function Deglitch(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var timeout_sec = config.time;
        if (config.timeUnits == 'milliseconds') timeout_sec *= 0.001;
        else if (config.timeUnits == 'minutes') timeout_sec *= 60;
        else if (config.timeUnits == 'hours') timeout_sec *= 60*60;

        var topics = {};

        this.on('input', function(msg) {
            payload = JSON.stringify(msg.payload);
            if ('topic' in msg)
                topic = msg.topic;
            else
                topic = 'defaulttopic';
            if (topic == '') topic = 'emptytopic';
            if (!(topic in topics)) {                       // on first message, just pass immediately                
                topics[topic] = {"value": payload, "message":msg, "timer":null};
                node.send(msg);
            } else if (topics[topic]['timer'] != null) {     // timer active                
                if (payload == topics[topic]['value']) {         // the value has just returned to the original
                    node.error('  ..shut down');
                    clearTimeout(topics[topic]['timer']);           //so shut down the timer
                    topics[topic]['timer'] = null;                     
                } else {                                        // the new value is not the original..                    
                    topics[topic]['newmessage'] = msg;
                }
            } else {                                        // timer is inactive, this is a new event                
                topics[topic]['newmessage'] = msg;
                topics[topic]['timer'] = setTimeout(function(){
                    node.error('timeout');
                    node.send(topics[topic]['newmessage']);
                    topics[topic]['message'] = topics[topic]['newmessage'];
                    topics[topic]['value'] = JSON.stringify(topics[topic]['message'].payload);
                    topics[topic]['newmessage'] = undefined;
                    topics[topic]['timer'] = null;
                }, timeout_sec*1000);
            }
        });        
    }
    RED.nodes.registerType("deglitch",Deglitch);
};
