import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Prisma } from '@prisma/client';

interface LogDetailsProps {
    description: string;
    metadata: Prisma.JsonValue;
    activity: string;
    date: Date;
  }

  export function LogDetailsDialog({ description, metadata, activity, date }: LogDetailsProps) {
    // Check if metadata is an object and not null
    const hasMetadata = metadata !== null &&
                       typeof metadata === 'object' &&
                       !Array.isArray(metadata) &&
                       Object.keys(metadata as object).length > 0;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activity}</DialogTitle>
            <DialogDescription>
              {new Date(date).toLocaleString('id-ID')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {hasMetadata && (
              <div>
                <h4 className="text-sm font-medium mb-2">Metadata</h4>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
