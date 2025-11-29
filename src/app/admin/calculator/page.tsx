
'use client';

import { CalculatorClient } from "./calculator-client";
import { Calculator, Loader } from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Supply } from "@/types";
import { useEffect } from "react";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

export default function AdminCalculatorPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  
  const suppliesCollection = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, 'supplies');
  }, [firestore, user]);

  const { data: supplies, isLoading: areSuppliesLoading } = useCollection<Supply>(suppliesCollection);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Calculator className="h-8 w-8" /> Calculadora de Custo Rápida
        </h1>
        <p className="text-muted-foreground">
          Calcule rapidamente o custo e o preço de venda de um item personalizado.
        </p>
      </div>
      {isUserLoading || (areSuppliesLoading && !supplies) ? (
         <div className="flex h-64 items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <CalculatorClient supplies={supplies || []} />
      )}
    </div>
  );
}
