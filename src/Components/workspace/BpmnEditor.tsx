import { 
  useEffect, 
  useRef, 
  useState, 
  useCallback, 
  useImperativeHandle, 
  forwardRef,
  type Ref 
} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';

/**supressio du properties panel 
 * 
 * // @ts-ignore
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
 */


import debounce from 'lodash.debounce';

// CSS imports
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';


/**
 * Props du composant BpmnEditor
 */
interface BpmnEditorProps {
  xml: string;
  /** Callback appelé lors de la sauvegarde (manuelle ou auto) */
  onSave: (xml: string) => Promise<void>;
  height?: string;
  validationPoints?: any[];
}


// Interface pour exposer le modeler au parent
export interface BpmnEditorHandle {
  saveXML: () => Promise<{ xml: string }>;
/** Retourne l'instance du modeler pour accès avancé (undo/redo, etc.) */
  getModeler: () => any;
  //test chagpt 
   focusElement: (elementId: string) => void
}

/**
 * Composant BpmnEditor
 * Éditeur BPMN complet avec palette, properties panel et auto-save.
 * Utilise forwardRef pour exposer les méthodes saveXML et getModeler au parent.
 */
export const BpmnEditor = forwardRef<BpmnEditorHandle, BpmnEditorProps>(
  (props, ref: Ref<BpmnEditorHandle>) => { // Typage explicite de ref
    const { xml, onSave, height = '600px', validationPoints = [] } = props;
    console.log("Validation points received:", validationPoints);
    // Références aux conteneurs DOM
    const containerRef = useRef<HTMLDivElement>(null); // Canvas principal
    const propertiesPanelRef = useRef<HTMLDivElement>(null); // Panneau de propriétés
    const modelerRef = useRef<any>(null); // Instance du modeler BPMN
    // États du composant
    const [isReady, setIsReady] = useState(false); // Modeler initialisé et prêt
    const [hasChanges, setHasChanges] = useState(false); // Modifications en attente
    const [error, setError] = useState<string | null>(null); // Erreur d'initialisation

    /**
     * Expose les méthodes au composant parent via useImperativeHandle
     * Le parent peut appeler editorRef.current.saveXML() ou getModeler()
     */
    useImperativeHandle(ref, () => ({
      saveXML: async () => {
        if (!modelerRef.current) {
          throw new Error('Modeler not initialized');
        }
        return await modelerRef.current.saveXML({ format: true });
      },
      /**
       * Retourne l'instance du modeler pour accès avancé
       * Utile pour undo/redo, export SVG, etc.
       * @returns Instance BpmnModeler
       */
      getModeler: () => modelerRef.current,
      focusElement
    }));

    /**
     * Auto-save avec debounce (30 secondes)
     * Déclenché automatiquement après chaque modification du diagramme.
     * Le debounce évite les sauvegardes multiples lors d'éditions rapides.
     * La sauvegarde se fait SANS recharger la page.
     */
    const debouncedSave = useCallback(
      debounce(async () => {
        // ne fais rien si pas de changement
        if (!modelerRef.current || !hasChanges) return;
        
        try {
          //console.log(' Auto-save triggered...');
          //Exporter XMl actuel 
          const { xml: savedXml } = await modelerRef.current.saveXML({ format: true });
          await onSave(savedXml);
          setHasChanges(false);
          console.log('Auto-save completed (no page reload)');
        } catch (error) {
          console.error(' Auto-save failed:', error);
        }
      }, 30000), //30 secondes
      [onSave, hasChanges]
    );
    
    /**
     * Effet d'initialisation du modeler BPMN
     * 
     * 1. Vérifie que les conteneurs DOM sont prêts
     * 2. Crée une instance BpmnModeler avec configuration BPMN 2.0 standard
     * 3. Importe le XML fourni en props
     * 4. Configure le zoom et les événements
     * 5. Active l'écoute des changements pour l'auto-save
     */
    useEffect(() => {
      //if (!containerRef.current || !propertiesPanelRef.current) {
      if (!containerRef.current) {
        setError('Conteneur non disponible');
        return;
      }

      if (!xml) {
        setError('Aucun diagramme à afficher');
        return;
      }

      try {
        const modeler = new BpmnModeler({
          container: containerRef.current,
          //propertiesPanel: {
            //parent: propertiesPanelRef.current
          //},
          //additionalModules: [
            //BpmnPropertiesPanelModule,
            //BpmnPropertiesProviderModule
          //]
        });

        modelerRef.current = modeler;

        modeler.importXML(xml)
          .then(() => {
            const canvas = modeler.get('canvas') as any;
            canvas.zoom('fit-viewport');
            setIsReady(true);
            setError(null);

            modeler.on('commandStack.changed', () => {
              setHasChanges(true);
              debouncedSave();
            });
          })
          .catch((err: any) => {
            console.error('Import error:', err);
            setError('Impossible de charger le diagramme');
          });

      } catch (err: any) {
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

   useEffect(() => {

  if (!isReady) return;
  if (!modelerRef.current) return;
  if (!validationPoints?.length) return;

  const modeler = modelerRef.current;

  // petit délai pour être sûr que elementRegistry est prêt
  setTimeout(() => {
      addValidationOverlays(validationPoints);
  }, 0);

}, [validationPoints, isReady]);
    // test chatgpt 
  const focusElement = (elementId: string) => {
  const modeler = modelerRef.current;
  if (!modeler) return;

  const elementRegistry = modeler.get('elementRegistry');
  const canvas = modeler.get('canvas');

  const element = elementRegistry.get(elementId);

  if (element) {
    canvas.scrollToElement(element);
    canvas.addMarker(elementId, 'highlight');
  }
};

 const addValidationOverlays = (points:any[]) => {

  const modeler = modelerRef.current;
  if(!modeler) return;

  const overlays = modeler.get("overlays");
  const elementRegistry = modeler.get("elementRegistry");

  overlays.clear();

  points.forEach(point => {

    if(point.status !== "open" || point.ignored) return;
    if(point.bpmn_element_id.startsWith("Process")) return;

    const element = elementRegistry.get(point.bpmn_element_id);

    console.log("Trying element:", point.bpmn_element_id, element);

    if(!element) return;

    const html = document.createElement("div");
    html.className = "bpmn-warning";
    html.innerText = "!";

    html.onclick = () => focusElement(point.bpmn_element_id);

    overlays.add(point.bpmn_element_id,{
      position:{ top:-6,right:-6 },
      html
    });

  });

};

    if (error) {
      return (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      );
    }

    return (
      <div className="flex gap-4 relative" style={{ height }}>
        <div
          ref={containerRef}
          className="flex-1 bg-white rounded-lg border shadow-sm"
        />
        {/*{hasChanges && (
          <div className="absolute top-2 right-2 badge badge-warning shadow-lg z-50">
            Changes not saved
          </div>
        )}*/}
      </div>
    );
  }
);

BpmnEditor.displayName = 'BpmnEditor';

/**
 * propiete panel (retourne)
 * <div
          ref={propertiesPanelRef}
          className="w-80 bg-white rounded-lg border shadow-sm overflow-auto"
        />
 * 
 */