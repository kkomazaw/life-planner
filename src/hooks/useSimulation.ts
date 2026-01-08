import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { SimulationSettings } from '@/types/simulation';
import { v4 as uuidv4 } from 'uuid';

export function useSimulation() {
  const [scenarios, setScenarios] = useState<SimulationSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await db.simulationSettings.toArray();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const createScenario = async (scenario: Omit<SimulationSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newScenario: SimulationSettings = {
      ...scenario,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.simulationSettings.add(newScenario);
    await loadScenarios();
    return newScenario;
  };

  const updateScenario = async (id: string, updates: Partial<SimulationSettings>) => {
    await db.simulationSettings.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    await loadScenarios();
  };

  const deleteScenario = async (id: string) => {
    await db.simulationSettings.delete(id);
    await loadScenarios();
  };

  const getScenario = async (id: string) => {
    return await db.simulationSettings.get(id);
  };

  return {
    scenarios,
    loading,
    createScenario,
    updateScenario,
    deleteScenario,
    getScenario,
  };
}
