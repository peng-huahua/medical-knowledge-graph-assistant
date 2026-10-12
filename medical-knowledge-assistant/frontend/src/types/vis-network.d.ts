declare module 'vis-network' {
  export class Network {
    constructor(
      container: HTMLElement, 
      data: any, 
      options: any
    );
    
    on(event: string, callback: (params: any) => void): void;
    destroy(): void;
    fit(): void;
    moveTo(options: any): void;
    redraw(): void;
    setOptions(options: any): void;
    setData(data: any): void;
    
    body: {
      data: {
        nodes: any;
        edges: any;
      };
      container: HTMLElement;
    };
  }
  
  export interface NetworkData {
    nodes: any[];
    edges: any[];
  }
  
  export interface NetworkOptions {
    nodes?: any;
    edges?: any;
    physics?: any;
    interaction?: any;
    manipulation?: any;
    configure?: any;
    groups?: any;
    layout?: any;
  }
} 