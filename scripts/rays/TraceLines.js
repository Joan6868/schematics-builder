import { componentManager } from '../components/ComponentManager.js';

function normalizeVector(v) {
    const length = Math.hypot(v.x, v.y);

    if (length === 0) {
        return { x: 0, y: 0 };
    }

    return {
        x: v.x / length,
        y: v.y / length
    };
}


function rotateVector(v, angleDegrees) {
    const angle = angleDegrees * Math.PI / 180;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos
    };
}


function reflectVector(direction, normal) {
    const d = normalizeVector(direction);
    const n = normalizeVector(normal);

    const dot = d.x * n.x + d.y * n.y;

    return {
        x: d.x - 2 * dot * n.x,
        y: d.y - 2 * dot * n.y
    };
}

// Trace line settings
export let showTraceLines = true;

// Draw trace lines connecting all parent-child relationships in the scene
export function drawTraceLines() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    
    // Create trace lines group if it doesn't exist
    let traceLinesGroup = document.getElementById("trace-lines-group");
    if (!traceLinesGroup) {
        traceLinesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        traceLinesGroup.setAttribute("id", "trace-lines-group");
        
        // Insert before components so they appear behind
        const componentsGroup = document.getElementById("schematics"); // or components group
        if (componentsGroup) {
             canvas.insertBefore(traceLinesGroup, componentsGroup);
        } else {
             canvas.appendChild(traceLinesGroup);
        }
    }
    
    // Clear existing trace lines
    while (traceLinesGroup.firstChild) {
        traceLinesGroup.removeChild(traceLinesGroup.firstChild);
    }
    
    if (!showTraceLines) return;
    
    // Iterate through all components
    componentManager.components.forEach((component) => {
        // Skip if this component has no parent
        if (component.parent === null) return;
        
        const parentComponent = componentManager.getComponent(component.parent);
        if (!parentComponent) return;
        
        // Get aperture centers in world space
        const childCenter = component.getApertureCenterWorld();
        const parentCenter = parentComponent.getApertureCenterWorld();
        
        // Draw black dotted line between aperture centers
        const traceLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        traceLine.setAttribute("x1", parentCenter.x);
        traceLine.setAttribute("y1", parentCenter.y);
        traceLine.setAttribute("x2", childCenter.x);
        traceLine.setAttribute("y2", childCenter.y);
        traceLine.setAttribute("stroke", "black");
        traceLine.setAttribute("stroke-width", "1");
        traceLine.setAttribute("stroke-dasharray", "5,5");
        traceLine.setAttribute("pointer-events", "none");
        traceLinesGroup.appendChild(traceLine);
        // // Preview the physically correct reflected direction for flat mirrors
        // if (component.type === 'mirror') {

        //     // Incoming beam direction: parent -> mirror
        //     const incomingDirection = normalizeVector({
        //         x: childCenter.x - parentCenter.x,
        //         y: childCenter.y - parentCenter.y
        //     });

        //     // Mirror's local normal is given by forwardVector.
        //     // Rotate it into world coordinates.
        //     const normalWorld = normalizeVector(
        //         rotateVector(component.forwardVector, component.rotation)
        //     );

        //     // Apply law of reflection
        //     const reflectedDirection = normalizeVector(
        //         reflectVector(incomingDirection, normalWorld)
        //     );

        //     // Length of preview line
        //     const previewLength = 150;

        //     const reflectedLine = document.createElementNS(
        //         "http://www.w3.org/2000/svg",
        //         "line"
        //     );

        //     reflectedLine.setAttribute("x1", childCenter.x);
        //     reflectedLine.setAttribute("y1", childCenter.y);

        //     reflectedLine.setAttribute(
        //         "x2",
        //         childCenter.x + reflectedDirection.x * previewLength
        //     );

        //     reflectedLine.setAttribute(
        //         "y2",
        //         childCenter.y + reflectedDirection.y * previewLength
        //     );

        //     reflectedLine.setAttribute("stroke", "#d14");
        //     reflectedLine.setAttribute("stroke-width", "2");
        //     reflectedLine.setAttribute("stroke-dasharray", "8,5");
        //     reflectedLine.setAttribute("pointer-events", "none");

        //     traceLinesGroup.appendChild(reflectedLine);
        // }
    });
}

export function hideTraceLines() {
    const traceLinesGroup = document.getElementById("trace-lines-group");
    if (traceLinesGroup) {
        // Clear children
         while (traceLinesGroup.firstChild) {
            traceLinesGroup.removeChild(traceLinesGroup.firstChild);
        }
    }
}

// Toggle trace lines
export function toggleTraceLines() {
    showTraceLines = !showTraceLines;
    const traceBtn = document.getElementById('trace-btn');
    
    if (showTraceLines) {
        drawTraceLines();
        traceBtn.textContent = 'Trace On';
    } else {
        hideTraceLines();
        traceBtn.textContent = 'Trace Off';
    }
}

// Update trace lines if they are currently visible
export function updateTraceLines() {
    if (showTraceLines) {
        drawTraceLines();
    }
}