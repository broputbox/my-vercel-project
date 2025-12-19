                    <p className="font-medium">{format(new Date(selectedLead.created_at), 'PPpp')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Select
                      value={selectedLead.status}
                      onValueChange={(value) => updateLeadStatus(selectedLead.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Won">Won</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message */}
                {selectedLead.message && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="bg-muted/50 rounded-lg p-4">{selectedLead.message}</p>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Internal Notes</p>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="Add notes about this lead..."
                  />
                  <Button onClick={updateLeadNotes} size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Save Notes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LeadsEnhanced;
