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

var helper = require('./helper');

var should = require("should");
var sinon = require("sinon");
var deglitchNode = require("../src/deglitch.js");

describe('deglitch Node', function() {

    beforeEach(function(done) {        
        helper.startServer(done);
        this.clock = sinon.useFakeTimers();
    });

    afterEach(function(done) {
        this.clock.restore();
        helper.unload().then(function() {            
            helper.stopServer(done);
        });
    });
    
    it('should register a new node-red node and load with defaults', function (done) {
      var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', time:5, wires: [[]]}];
      return helper.load(deglitchNode, flow, function () {
        var n1 = helper.getNode('node1');
        n1.should.have.property('name', 'deglitch');
        n1.should.have.property('time', 5);
        n1.should.have.property('timeUnits', 'seconds');
        n1.should.have.property('mode', 1);
        done();
      });
    });

    it('should be able to set timeout to milliseconds', function(done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', time:5, timeUnits:'milliseconds', wires: [[]]}];
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            n1.should.have.property('time', 0.005);
            done();
      });
    });


    it('should be able to set timeout to seconds', function(done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', time:5, timeUnits:'seconds', wires: [[]]}];
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            n1.should.have.property('time', 5);
            done();
      });
    });

    it('should be able to set timeout to minutes', function(done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', time:5, timeUnits:'minutes', wires: [[]]}];
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            n1.should.have.property('time', 5*60);
            done();
      });
    });

    it('should be able to set timeout to hour', function(done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', time:5, timeUnits:'hours', wires: [[]]}];
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            n1.should.have.property('time', 5*3600);
            done();
      });
    });

    it('should pass the first message without delay', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', wires: [['helperNode1']]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var got = false;
            h.on("input", function(msg) {
                if (msg.payload == 'hay!') got = true;            
            });
            n1.receive({'payload':'hay!'});
            should.equal(got, true);
            done();
        });        
    });

    it('should block the second message', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', wires: [['helperNode1']]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var got = false;
            h.on("input", function(msg) {
                if (msg.payload == 'hay!') got = true;            
            });
            n1.receive({'payload':'hey!'});
            n1.receive({'payload':'hay!'});            
            should.equal(got, false);
            done();
        });        
    });

    it('should second message delayed with timeout', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', 'time':5, 'timeUnits': 'seconds', wires: [['helperNode1']]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        clock = this.clock;
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var got = false;
            h.on("input", function(msg) {                
                if (msg.payload == 'hay!') got = true;
            });
            n1.receive({'payload':'hey!'});
            n1.receive({'payload':'hay!'});            
            clock.tick(4999);
            should.equal(got, false);
            clock.tick(1);
            should.equal(got, true);
            done();
        });        
    });


    it('should second message dismissed if it has same payload', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', 'time':5, 'timeUnits': 'seconds', wires: [['helperNode1']]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        clock = this.clock;
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var got = 0;
            h.on("input", function(msg) {                
                if (msg.payload == 'hey!') got += 1;
            });
            n1.receive({'payload':'hey!'});
            n1.receive({'payload':'hey!'});            
            clock.tick(4999);
            should.equal(got, 1);
            clock.tick(1);
            should.equal(got, 1);
            done();
        });        
    });


    it('should second message dismissed if we return to the original value within time', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', 'time':5, 'timeUnits': 'seconds', wires: [['helperNode1']]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        clock = this.clock;
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var got = 0;
            h.on("input", function(msg) {                
                if (msg.payload == 'hey!') got += 1;
            });
            n1.receive({'payload':'hey!'});
            should.equal(got, 1);
            n1.receive({'payload':'hay!'});
            should.equal(got, 1);
            clock.tick(4999);
            n1.receive({'payload':'hey!'});
            should.equal(got, 1);
            clock.tick(10000);
            should.equal(got, 1);            
            done();
        });        
    });

    it('should remove impulses that are shorter than timeout and pass others', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', 'time':5, 'timeUnits': 'seconds', wires: [['helperNode1']]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        clock = this.clock;
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var gothey = 0;
            var gothay = 0;
            h.on("input", function(msg) {                
                if (msg.payload == 'hey!') gothey += 1;
                if (msg.payload == 'hay!') gothay += 1;
            });
            n1.receive({'payload':'hey!'});
            should.equal(gothey, 1);

            for (i=4995; i<5000; i++) {
                n1.receive({'payload':'hay!'});
                clock.tick(i);
                n1.receive({'payload':'hey!'});
                clock.tick(10000);
                should.equal(gothey, 1);
                should.equal(gothay, 0);    
            }

            for (i=5000; i<5005; i++) {
                n1.receive({'payload':'hay!'});
                clock.tick(i);
                n1.receive({'payload':'hey!'});
                clock.tick(10000);
                should.equal(gothey, 1+i-4999);
                should.equal(gothay, i-4999);    
            }

            done();
        }); 
    });

    it('should a 3rd different message passed after the timeout from second ', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', 'time':5, 'timeUnits': 'seconds', wires: [['helperNode1']]},
                    {id:"helperNode1", type:"helper", wires:[]}];
        clock = this.clock;
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var got = false;
            h.on("input", function(msg) {                
                if (msg.payload == 'hay!') got = true;
            });
            n1.receive({'payload':'hey!'});            
            n1.receive({'payload':'hoo!'});
            clock.tick(100);
            n1.receive({'payload':'hay!'});            
            clock.tick(4899);
            should.equal(got, false);
            clock.tick(1);
            should.equal(got, true);
            done();
        });        
    });

    it('should handle messages with different topics independently of eachother', function (done) {
        var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', 'time':5, 'timeUnits': 'seconds', 'mode':1, wires: [['helperNode1']]},
                   {id:"helperNode1", type:"helper", wires:[]}];
        clock = this.clock;
        return helper.load(deglitchNode, flow, function () {
            var n1 = helper.getNode('node1');            
            var h = helper.getNode('helperNode1');
            var got = {};            
            h.on("input", function(msg) {
                try {                
                    if (!(msg.topic in got)) got[msg.topic] = {};                    
                    if (!(msg.payload in got[msg.topic])) got[msg.topic][msg.payload] = 0;
                    got[msg.topic][msg.payload]++;                
                } catch (e) {
                    console.log(e);
                }
            });
            try {
                for (i=0; i<5; i++) {                
                    n1.receive({'payload':'hey', 'topic':'t'+i.toString()});                
                    should.equal(got['t'+i.toString()]['hey'],1);
                }            
                n1.receive({'payload':'hoo', 'topic':'t0'});
                clock.tick(1000);            
                for (i=1; i<5; i++) {                
                    n1.receive({'payload':'hoo', 'topic':'t'+i.toString()});                                
                }
                clock.tick(1000);
                n1.receive({'payload':'hey', 'topic':'t0'});
                clock.tick(3000);
                should.equal('hoo' in got['t0'], false);                
                clock.tick(1000);
                for (i=1; i<5; i++) should.equal('hoo' in got['t'+i.toString()], true);                
            } catch (e) {
                console.log(e);
            }

            done();
        });         
    });




});
