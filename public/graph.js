(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.createGraph=f()}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r}()({1:[function(require,module,exports){module.exports=createGraph;var eventify=require("ngraph.events");function createGraph(options){options=options||{};if("uniqueLinkId"in options){console.warn("ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\n"+"Use `multigraph` option instead\n","\n","Note: there is also change in default behavior: From now on each graph\n"+"is considered to be not a multigraph by default (each edge is unique).");options.multigraph=options.uniqueLinkId}if(options.multigraph===undefined)options.multigraph=false;var nodes=typeof Object.create==="function"?Object.create(null):{},links=[],multiEdges={},nodesCount=0,suspendEvents=0,forEachNode=createNodeIterator(),createLink=options.multigraph?createUniqueLink:createSingleLink,changes=[],recordLinkChange=noop,recordNodeChange=noop,enterModification=noop,exitModification=noop;var graphPart={addNode:addNode,addLink:addLink,removeLink:removeLink,removeNode:removeNode,getNode:getNode,getNodesCount:function(){return nodesCount},getLinksCount:function(){return links.length},getLinks:getLinks,forEachNode:forEachNode,forEachLinkedNode:forEachLinkedNode,forEachLink:forEachLink,beginUpdate:enterModification,endUpdate:exitModification,clear:clear,hasLink:getLink,hasNode:getNode,getLink:getLink};eventify(graphPart);monitorSubscribers();return graphPart;function monitorSubscribers(){var realOn=graphPart.on;graphPart.on=on;function on(){graphPart.beginUpdate=enterModification=enterModificationReal;graphPart.endUpdate=exitModification=exitModificationReal;recordLinkChange=recordLinkChangeReal;recordNodeChange=recordNodeChangeReal;graphPart.on=realOn;return realOn.apply(graphPart,arguments)}}function recordLinkChangeReal(link,changeType){changes.push({link:link,changeType:changeType})}function recordNodeChangeReal(node,changeType){changes.push({node:node,changeType:changeType})}function addNode(nodeId,data){if(nodeId===undefined){throw new Error("Invalid node identifier")}enterModification();var node=getNode(nodeId);if(!node){node=new Node(nodeId,data);nodesCount++;recordNodeChange(node,"add")}else{node.data=data;recordNodeChange(node,"update")}nodes[nodeId]=node;exitModification();return node}function getNode(nodeId){return nodes[nodeId]}function removeNode(nodeId){var node=getNode(nodeId);if(!node){return false}enterModification();var prevLinks=node.links;if(prevLinks){node.links=null;for(var i=0;i<prevLinks.length;++i){removeLink(prevLinks[i])}}delete nodes[nodeId];nodesCount--;recordNodeChange(node,"remove");exitModification();return true}function addLink(fromId,toId,data){enterModification();var fromNode=getNode(fromId)||addNode(fromId);var toNode=getNode(toId)||addNode(toId);var link=createLink(fromId,toId,data);links.push(link);addLinkToNode(fromNode,link);if(fromId!==toId){addLinkToNode(toNode,link)}recordLinkChange(link,"add");exitModification();return link}function createSingleLink(fromId,toId,data){var linkId=makeLinkId(fromId,toId);return new Link(fromId,toId,data,linkId)}function createUniqueLink(fromId,toId,data){var linkId=makeLinkId(fromId,toId);var isMultiEdge=multiEdges.hasOwnProperty(linkId);if(isMultiEdge||getLink(fromId,toId)){if(!isMultiEdge){multiEdges[linkId]=0}var suffix="@"+ ++multiEdges[linkId];linkId=makeLinkId(fromId+suffix,toId+suffix)}return new Link(fromId,toId,data,linkId)}function getLinks(nodeId){var node=getNode(nodeId);return node?node.links:null}function removeLink(link){if(!link){return false}var idx=indexOfElementInArray(link,links);if(idx<0){return false}enterModification();links.splice(idx,1);var fromNode=getNode(link.fromId);var toNode=getNode(link.toId);if(fromNode){idx=indexOfElementInArray(link,fromNode.links);if(idx>=0){fromNode.links.splice(idx,1)}}if(toNode){idx=indexOfElementInArray(link,toNode.links);if(idx>=0){toNode.links.splice(idx,1)}}recordLinkChange(link,"remove");exitModification();return true}function getLink(fromNodeId,toNodeId){var node=getNode(fromNodeId),i;if(!node||!node.links){return null}for(i=0;i<node.links.length;++i){var link=node.links[i];if(link.fromId===fromNodeId&&link.toId===toNodeId){return link}}return null}function clear(){enterModification();forEachNode(function(node){removeNode(node.id)});exitModification()}function forEachLink(callback){var i,length;if(typeof callback==="function"){for(i=0,length=links.length;i<length;++i){callback(links[i])}}}function forEachLinkedNode(nodeId,callback,oriented){var node=getNode(nodeId);if(node&&node.links&&typeof callback==="function"){if(oriented){return forEachOrientedLink(node.links,nodeId,callback)}else{return forEachNonOrientedLink(node.links,nodeId,callback)}}}function forEachNonOrientedLink(links,nodeId,callback){var quitFast;for(var i=0;i<links.length;++i){var link=links[i];var linkedNodeId=link.fromId===nodeId?link.toId:link.fromId;quitFast=callback(nodes[linkedNodeId],link);if(quitFast){return true}}}function forEachOrientedLink(links,nodeId,callback){var quitFast;for(var i=0;i<links.length;++i){var link=links[i];if(link.fromId===nodeId){quitFast=callback(nodes[link.toId],link);if(quitFast){return true}}}}function noop(){}function enterModificationReal(){suspendEvents+=1}function exitModificationReal(){suspendEvents-=1;if(suspendEvents===0&&changes.length>0){graphPart.fire("changed",changes);changes.length=0}}function createNodeIterator(){return Object.keys?objectKeysIterator:forInIterator}function objectKeysIterator(callback){if(typeof callback!=="function"){return}var keys=Object.keys(nodes);for(var i=0;i<keys.length;++i){if(callback(nodes[keys[i]])){return true}}}function forInIterator(callback){if(typeof callback!=="function"){return}var node;for(node in nodes){if(callback(nodes[node])){return true}}}}function indexOfElementInArray(element,array){if(!array)return-1;if(array.indexOf){return array.indexOf(element)}var len=array.length,i;for(i=0;i<len;i+=1){if(array[i]===element){return i}}return-1}function Node(id,data){this.id=id;this.links=null;this.data=data}function addLinkToNode(node,link){if(node.links){node.links.push(link)}else{node.links=[link]}}function Link(fromId,toId,data,id){this.fromId=fromId;this.toId=toId;this.data=data;this.id=id}function hashCode(str){var hash=0,i,chr,len;if(str.length==0)return hash;for(i=0,len=str.length;i<len;i++){chr=str.charCodeAt(i);hash=(hash<<5)-hash+chr;hash|=0}return hash}function makeLinkId(fromId,toId){return fromId.toString()+"👉 "+toId.toString()}},{"ngraph.events":2}],2:[function(require,module,exports){module.exports=function(subject){validateSubject(subject);var eventsStorage=createEventsStorage(subject);subject.on=eventsStorage.on;subject.off=eventsStorage.off;subject.fire=eventsStorage.fire;return subject};function createEventsStorage(subject){var registeredEvents=Object.create(null);return{on:function(eventName,callback,ctx){if(typeof callback!=="function"){throw new Error("callback is expected to be a function")}var handlers=registeredEvents[eventName];if(!handlers){handlers=registeredEvents[eventName]=[]}handlers.push({callback:callback,ctx:ctx});return subject},off:function(eventName,callback){var wantToRemoveAll=typeof eventName==="undefined";if(wantToRemoveAll){registeredEvents=Object.create(null);return subject}if(registeredEvents[eventName]){var deleteAllCallbacksForEvent=typeof callback!=="function";if(deleteAllCallbacksForEvent){delete registeredEvents[eventName]}else{var callbacks=registeredEvents[eventName];for(var i=0;i<callbacks.length;++i){if(callbacks[i].callback===callback){callbacks.splice(i,1)}}}}return subject},fire:function(eventName){var callbacks=registeredEvents[eventName];if(!callbacks){return subject}var fireArguments;if(arguments.length>1){fireArguments=Array.prototype.splice.call(arguments,1)}for(var i=0;i<callbacks.length;++i){var callbackInfo=callbacks[i];callbackInfo.callback.apply(callbackInfo.ctx,fireArguments)}return subject}}}function validateSubject(subject){if(!subject){throw new Error("Eventify cannot use falsy object as events subject")}var reservedWords=["on","fire","off"];for(var i=0;i<reservedWords.length;++i){if(subject.hasOwnProperty(reservedWords[i])){throw new Error("Subject cannot be eventified, since it already has property '"+reservedWords[i]+"'")}}}},{}]},{},[1])(1)});