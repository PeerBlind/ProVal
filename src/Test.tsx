function Test() {
  return(
    <div className="flex justify-center">
      <div className="w-2/3 flex-col gap-4 my-15 bg-base-300 p-5 rounded-2xl">
         <div className="flex gap-4 justify-center ">
          <input type="text"
                className="input rounded-2xl"
                placeholder="Nom d'utlisateur"
          />
          <input type="text"
                className="input rounded-2xl"
                placeholder="Mot de passe"
          />
          <button className="bg-blue-300 transition 
          delay-150 duration-300 ease-in-out 
          hover:-translate-y-1 hover:scale-110 
          hover:bg-green-700 ... rounded-2xl"> 
            Se connecter
            </button>
          </div> 
      </div>
        <div>
      <div className=" flex justify-center
      bg-linear-to-r
       from-purple-950 via-pink-500
        to-gray-500 to-90%  mt-20 pt-16 text-cyan-50 ">
         <span className="justify-center">
             AK
          </span>
      </div>

      <div className="bg-green-300 pt-56">
          Bienvue chez Daimo !!!!
      </div>
    </div>
    

       
    </div>

  )

}
export default Test
/**
 * Mon bpmneditor avant chatgpt 
 * // src/components/bpmn/BpmnEditor.tsx
 import { useEffect, useRef, useState, useCallback } from 'react';
 import BpmnModeler from 'bpmn-js/lib/Modeler';
 import {
   BpmnPropertiesPanelModule,
   BpmnPropertiesProviderModule,
 } from 'bpmn-js-properties-panel';
 
 import debounce from 'lodash.debounce';
 
 // CSS imports
 import 'bpmn-js/dist/assets/diagram-js.css';
 import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
 //import 'bpmn-js-properties-panel/dist/assets/properties-panel.css';
 
 interface BpmnEditorProps {
   xml: string;
   onSave: (xml: string) => Promise<void>;
   height?: string;
 }
 
 
 export const BpmnEditor = ({ xml, onSave, height = '900px' }: BpmnEditorProps) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const propertiesPanelRef = useRef<HTMLDivElement>(null);
   const modelerRef = useRef<any>(null);
   const [isReady, setIsReady] = useState(false);
   const [hasChanges, setHasChanges] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   // Auto-save (30s)
   const debouncedSave = useCallback(
     debounce(async () => {
       if (!modelerRef.current || !hasChanges) return;
       try {
         const { xml } = await modelerRef.current.saveXML({ format: true });
         await onSave(xml);
         setHasChanges(false);
         console.log('✅ Auto-save completed');
       } catch (error) {
         console.error('❌ Auto-save failed:', error);
       }
     }, 30000),
     [onSave, hasChanges]
   );
 
   useEffect(() => {
     if (!containerRef.current || !propertiesPanelRef.current) {
       setError('Conteneur non disponible');
       return;
     }
 
     if (!xml) {
       setError('Aucun diagramme à afficher');
       return;
     }
 
     try {
       // Configuration BPMN 2.0 standard (sans Camunda)
       const modeler = new BpmnModeler({
         container: containerRef.current,
         propertiesPanel: {
           parent: propertiesPanelRef.current
         },
         additionalModules: [
           BpmnPropertiesPanelModule,
           BpmnPropertiesProviderModule
         ]
         //  Pas de moddleExtensions !
       });
 
       modelerRef.current = modeler;
 
       modeler.importXML(xml).then(() => {
         const canvas = modeler.get('canvas') as any;
         canvas.zoom('fit-viewport');
         setIsReady(true);
         setError(null);
         // Écouter les changements pour auto-save
         modeler.on('commandStack.changed', () => {
           setHasChanges(true);
           debouncedSave();
         });
       }).catch((err) => {
         console.error('Import error:', err);
         setError('Impossible de charger le diagramme');
       });
 
     } catch (err) {
       console.error('Modeler creation error:', err);
       setError('Erreur de création');
     }
 
     return () => {
       debouncedSave.cancel();
       if (modelerRef.current) {
         modelerRef.current.destroy();
       }
     };
   }, [xml, debouncedSave]);
 
   if (error) {
     return <div className="alert alert-error"><span>{error}</span></div>;
   }
 
   return (
     <div className="flex gap-4 relative" style={{ height }}>
       {/* Canvas BPMN avec palette 
       <div
         ref={containerRef}
         className="flex-1 bg-white rounded-lg border shadow-sm"
       />
 
       /* Panneau de propriétés BPMN 2.0 
       <div
         ref={propertiesPanelRef}
         className="w-80 bg-white rounded-lg border shadow-sm overflow-auto"
       />
       {/* Indicateur changements *
       {hasChanges && (
         <div className="absolute top-2 right-2 badge badge-warning">
           Modifications non sauvegardées
         </div>
       )}
     </div>
   );
 };
 
 
 * 
 */
/**
 * mon bpmnviewer avant chatgpt : 
 * import { useEffect, useRef, useState } from 'react';
 import BpmnModeler from 'bpmn-js/lib/Modeler';
 import 'bpmn-js/dist/assets/diagram-js.css';
 import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
 
 interface BpmnViewerProps {
   xml: string;
   height?: string;
 }
 
 export const BpmnViewer = ({ xml, height = '600px' }: BpmnViewerProps) => {
   const containerRef = useRef<HTMLDivElement | null>(null);
   const modelerRef = useRef<any>(null);
   const [isReady, setIsReady] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   //j'ai changer mon useEffect copie chatgpt 
 useEffect(() => {
   if (!xml || !containerRef.current) return;
 
   setIsReady(false);
   setError(null);
 
   const viewer = new BpmnModeler({
     container: containerRef.current
   });
 
   modelerRef.current = viewer;
 
   (async () => {
     try {
       console.log("XML LENGTH:", xml?.length);
       console.log("XML START:", xml?.substring(0, 300));
       await viewer.importXML(xml);
       const canvas = viewer.get('canvas') as any;
       const rootElement = canvas.getRootElement();
       canvas.zoom('fit-viewport');
       canvas.scrollToElement(rootElement);
       setIsReady(true);
     } catch (err: unknown) {
 
         if (err instanceof Error) {
         console.error('Import error:', err.message);
         } else {
         console.error('Import error:', err);
       }
 
       setError('Diagramme invalide');
     }
   })();
 
   return () => {
     viewer.destroy();
   };
 }, [xml]);
 
   return (
     <div 
     className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200"
     >
       
       {!isReady && !error && (
         <div 
           className="absolute inset-0 flex items-center justify-center bg-white z-10"
           style={{ height }}
         >
           <div className="flex flex-col items-center gap-4">
             <span className="loading loading-spinner loading-lg text-primary"></span>
             <span className="text-gray-600">Chargement...</span>
           </div>
         </div>
       )}
 
       // Error 
       {error && (
         <div 
           className="absolute inset-0 flex items-center justify-center bg-white z-10"
           style={{ height }}
         >
           <div className="alert alert-error max-w-md">
             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span>{error}</span>
           </div>
         </div>
       )}
 
        /Container 
       <div
         ref={containerRef}
         className='w-full'
         style={{ 
           height}}
       />
     </div>
   );
 }; 
 * 
 * 
 */
 
/**
 * ma dashboard avant chatgpt 
 * import DashboardNavbar from "../Components/layout/DashboardNavbar";
 import AIChatPanel from "../Components/workspace/AiChatPanel";
 import BPMNViewerComponent from "../Components/workspace/BpmnModeler";
 
 
 export default function DashboardPage() {
   return (
     <div className="h-screen flex flex-col">
 
       <DashboardNavbar />
 
       <div className="flex flex-1 overflow-hidden">
 
         <div className="w-2/3 bg-base-200 p-4">
           <BPMNViewerComponent />
         </div>
 
         <div className="w-1/3 border-l bg-base-100">
           <AIChatPanel />
         </div>
 
       </div>
     </div>
   );
 }
 */