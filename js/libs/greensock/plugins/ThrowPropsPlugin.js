/**
 * VERSION: 0.5
 * DATE: 2012-07-30
 * JavaScript (also available in ActionScript 3 and 2)
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * corporate Club GreenSock members, the software agreement that was issued with the corporate 
 * membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue || (window._gsQueue = [])).push( function() {

	_gsDefine("plugins.ThrowPropsPlugin", ["plugins.TweenPlugin", "TweenLite", "easing.Ease"], function(TweenPlugin, TweenLite, Ease) {
		
		var ThrowPropsPlugin = function(props, priority) {
				TweenPlugin.call(this, "throwProps");
				this._overwriteProps.length = 0;
			},
			_calculateChange = ThrowPropsPlugin.calculateChange = function(velocity, ease, duration, checkpoint) {
				if (checkpoint == null) {
					checkpoint = 0.05;
				}
				var e = (ease instanceof Ease) ? ease : (ease == null) ? TweenLite.defaultEase : new Ease(ease);
				return (duration * checkpoint * velocity) / e.getRatio(checkpoint);
			},
			_calculateDuration = ThrowPropsPlugin.calculateDuration = function(start, end, velocity, ease, checkpoint) {
				if (checkpoint == null) {
					checkpoint = 0.05;
				}
				var e = (ease instanceof Ease) ? ease : (ease == null) ? TweenLite.defaultEase : new Ease(ease);
				return Math.abs( (end - start) * e.getRatio(checkpoint) / velocity / checkpoint );
			},
			_calculateTweenDuration = ThrowPropsPlugin.calculateTweenDuration = function(target, vars, maxDuration, minDuration, overshootTolerance) {
				var duration = 0,
					clippedDuration = 9999999999,
					throwPropsVars = (vars.throwProps != null) ? vars.throwProps : vars,
					ease = (vars.ease instanceof Ease) ? vars.ease : (vars.ease == null) ? TweenLite.defaultEase : new Ease(vars.ease),
					checkpoint = isNaN(throwPropsVars.checkpoint) ? 0.05 : Number(throwPropsVars.checkpoint),
					resistance = isNaN(throwPropsVars.resistance) ? ThrowPropsPlugin.defaultResistance : Number(throwPropsVars.resistance),
					p, curProp, curDuration, curVelocity, curResistance, curVal, end, curClippedDuration;
					
				for (p in throwPropsVars) {
					
					if (p !== "resistance" && p !== "checkpoint") {
						curProp = throwPropsVars[p];
						if (typeof(curProp) === "number") {
							curVelocity = Number(curProp);
							curDuration = (curVelocity * resistance > 0) ? curVelocity / resistance : curVelocity / -resistance;
							
						} else {
							curVelocity = Number(curProp.velocity) || 0;
							curResistance = isNaN(curProp.resistance) ? resistance : Number(curProp.resistance);
							curDuration = (curVelocity * curResistance > 0) ? curVelocity / curResistance : curVelocity / -curResistance;
							curVal = (typeof(target[p]) === "function") ? target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]() : target[p];
							end = curVal + calculateChange(curVelocity, ease, curDuration, checkpoint);
							if (curProp.max != null && end > Number(curProp.max)) {
								//if the value is already exceeding the max or the velocity is too low, the duration can end up being uncomfortably long but in most situations, users want the snapping to occur relatively quickly (0.75 seconds), so we implement a cap here to make things more intuitive.
								curClippedDuration = (curVal > curProp.max || (curVelocity > -15 && curVelocity < 45)) ? 0.75 : _calculateDuration(curVal, curProp.max, curVelocity, ease, checkpoint);
								if (curClippedDuration + overshootTolerance < clippedDuration) {
									clippedDuration = curClippedDuration + overshootTolerance;
								}
								
							} else if (curProp.min != null && end < Number(curProp.min)) {
								//if the value is already exceeding the min or if the velocity is too low, the duration can end up being uncomfortably long but in most situations, users want the snapping to occur relatively quickly (0.75 seconds), so we implement a cap here to make things more intuitive.
								curClippedDuration = (curVal < curProp.min || (curVelocity > -45 && curVelocity < 15)) ? 0.75 : _calculateDuration(curVal, curProp.min, curVelocity, ease, checkpoint);
								if (curClippedDuration + overshootTolerance < clippedDuration) {
									clippedDuration = curClippedDuration + overshootTolerance;
								}
							}
							
							if (curClippedDuration > duration) {
								duration = curClippedDuration;
							}
						}
						
						if (curDuration > duration) {
							duration = curDuration;
						}
						
					}
				}
				if (duration > clippedDuration) {
					duration = clippedDuration;
				}
				if (duration > maxDuration) {
					return maxDuration;
				} else if (duration < minDuration) {
					return minDuration;
				}
				return duration;
			},
			p = ThrowPropsPlugin.prototype = new TweenPlugin("throwProps");
			
		
		p.constructor = ThrowPropsPlugin;
		ThrowPropsPlugin.API = 2;
		ThrowPropsPlugin.defaultResistance = 100;
		
		ThrowPropsPlugin.to = function(target, vars, maxDuration, minDuration, overshootTolerance) {
			if (vars.throwProps == null) {
				vars = {throwProps:vars};
			}
			return new TweenLite(target, _calculateTweenDuration(target, vars, maxDuration, minDuration, overshootTolerance), vars);
		};
		
		p._onInitTween = function(target, value, tween) {
			this._target = target;
			this._props = [];
			var ease = tween._ease,
				checkpoint = isNaN(value.checkpoint) ? 0.05 : Number(value.checkpoint),
				duration = tween._duration, 
				cnt = 0,
				p, curProp, curVal, isFunc, velocity, change1, end, change2;
			for (p in value) {
				if (p !== "resistance" && p !== "checkpoint") {
					curProp = value[p];
					if (typeof(curProp) === "number") {
						velocity = Number(curProp);
					} else if (!isNaN(curProp.velocity)) {
						velocity = Number(curProp.velocity);
					} else {
						throw("ERROR: No velocity was defined in the throwProps tween of " + target + " property: " + p);
						velocity = 0;
					}
					change1 = _calculateChange(velocity, ease, duration, checkpoint);
					change2 = 0;
					isFunc = (typeof(target[p]) == "function");
					curVal = (isFunc) ? target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]() : target[p];
					if (typeof(curProp) !== "number") {
						end = curVal + change1;
						if (curProp.max != null && Number(curProp.max) < end) {
							change2 = (curProp.max - curVal) - change1;
							
						} else if (curProp.min != null && Number(curProp.min) > end) {							
							change2 = (curProp.min - curVal) - change1;
						}
					}
					this._props[cnt++] = {p:p, s:curVal, c1:change1, c2:change2, f:isFunc, r:false};
					this._overwriteProps[cnt] = p;
					console.log(p+": "+curVal+", c1: "+change1+", c2: "+change2);
				}
			}
			return true;
		};
		
		p._kill = function(lookup) {
			var i = this._props.length;
			while (--i > -1) {
				if (lookup[this._props[i].p] != null) {
					this._props.splice(i, 1);
				}
			}
			return TweenPlugin.prototype._kill.call(this, lookup);
		}
		
		p._roundProps = function(lookup, value) {
			var p = this._props,
				i = p.length;
			while (--i > -1) {
				if (lookup[p[i]] || lookup.throwProps) {
					p[i].r = value;
				}
			}
		}
		
		p.setRatio = function(v) {
			var i = this._props.length, 
				cp, val;
			while (--i > -1) {
				cp = this._props[i];
				val = cp.s + cp.c1 * v + cp.c2 * v * v;
				if (cp.r) {
					val = (val + ((val > 0) ? 0.5 : -0.5)) >> 0;
				}
				if (cp.f) {
					this._target[cp.p](val);
				} else {
					this._target[cp.p] = val;
				}
			}	
		};
		
		TweenPlugin.activate([ThrowPropsPlugin]);
		
		return ThrowPropsPlugin;
		
	}, true);

}); if (window._gsDefine) { _gsQueue.pop()(); }