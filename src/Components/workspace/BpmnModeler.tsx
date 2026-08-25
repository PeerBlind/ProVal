import { useEffect, useRef } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { useDropzone } from "react-dropzone";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

/**
 * Integration du diagramme BPMN
 * @returns 
 */
export default function BPMNModelerComponent() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: window,
      },
    });

    createEmptyDiagram();

    return () => {
      modelerRef.current?.destroy();
    };
  }, []);

  const createEmptyDiagram = async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
      xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
      id="Definitions_1"
      targetNamespace="http://bpmn.io/schema/bpmn">
      <bpmn:process id="Process_1" isExecutable="false">
        <bpmn:startEvent id="StartEvent_1"/>
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"/>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>`;

    await modelerRef.current.importXML(xml);
    modelerRef.current.get("canvas").zoom("fit-viewport");
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const xml = await file.text();
      await modelerRef.current.importXML(xml);
      modelerRef.current.get("canvas").zoom("fit-viewport");
    } catch (error) {
      console.error("Erreur import BPMN:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/xml": [".bpmn", ".xml"],
      "text/xml": [".bpmn", ".xml"],
    },
  });

  return (
    <div {...getRootProps()} className="w-full h-full relative bg-white rounded-xl">
      <input {...getInputProps()} />
      <div
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
}
