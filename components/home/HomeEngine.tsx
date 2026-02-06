"use client";

import { VendorCollectionGrid } from "./VendorCollectionGrid";
import type { VendorCollection, HomeSection } from "@/types";

interface HomeEngineProps {
  sections?: HomeSection[];
  vendorCollections?: VendorCollection[];
}

/**
 * Home Engine - Renders different section types dynamically
 * Similar to PDP Engine pattern for extensibility
 */
export function HomeEngine({ sections, vendorCollections }: HomeEngineProps) {
  // If sections are provided, render based on section types
  if (sections && sections.length > 0) {
    const activeSections = sections
      .filter((section) => section.is_active)
      .sort((a, b) => a.position - b.position);
    
    if (activeSections.length > 0) {
      return (
        <>
          {activeSections.map((section) => (
            <SectionRenderer 
              key={section.id} 
              section={section} 
              vendorCollections={vendorCollections}
            />
          ))}
        </>
      );
    }
  }

  // Fallback: Render vendor collections if provided directly
  if (vendorCollections && vendorCollections.length > 0) {
    return <VendorCollectionGrid collections={vendorCollections} columns={2} />;
  }

  return null;
}

interface SectionRendererProps {
  section: HomeSection;
  vendorCollections?: VendorCollection[];
}

function SectionRenderer({ section, vendorCollections }: SectionRendererProps) {
  const { section_type, config_json } = section;

  switch (section_type) {
    case "vendor_collection_grid":
      // config_json.collections can be array of IDs (numbers) or full collection objects
      let collections: VendorCollection[] = [];
      
      if (Array.isArray(config_json.collections)) {
        // Check if first item is a number (ID) or object (full collection)
        if (config_json.collections.length > 0 && typeof config_json.collections[0] === 'number') {
          // Array of IDs - filter vendorCollections by IDs
          const collectionIds = config_json.collections as number[];
          collections = (vendorCollections || []).filter(c => collectionIds.includes(c.id));
        } else {
          // Array of full collection objects
          collections = config_json.collections as VendorCollection[];
        }
      }
      
      const columns = (config_json.columns as 1 | 2) || 2;
      if (collections.length > 0) {
        return <VendorCollectionGrid collections={collections} columns={columns} />;
      }
      return null;

    // Add more section types here as needed
    // case "campaign_banner":
    //   return <CampaignBanner {...config_json} />;
    // case "category_highlight":
    //   return <CategoryHighlight {...config_json} />;

    default:
      console.warn(`Unknown section type: ${section_type}`);
      return null;
  }
}
