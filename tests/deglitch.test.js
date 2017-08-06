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
var deglitchNode = require("../src/deglitch.js");

describe('deglitch Node', function() {

    beforeEach(function(done) {        
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload().then(function() {
            helper.stopServer(done);
        });
    });
    
    it('should register a new node-red node', function (done) {
      var flow = [{id: 'node1', type: 'deglitch', name: 'deglitch', time:5, timeUnits:'seconds', wires: [[]]}];
      return helper.load(deglitchNode, flow, function () {
        var n1 = helper.getNode('node1');
        n1.should.have.property('name', 'deglitch');
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


/*
    it('should pass the first message without delay', function (done) {
        done();
    });
*/
    

});
