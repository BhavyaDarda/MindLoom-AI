import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  FileText,
  Brain,
  Headphones,
  Scale,
  ExternalLink,
  Search
} from 'lucide-react';
import { useTransformationHistory } from '@/hooks/useTransformationHistory';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Input } from '@/components/ui/input';

export function TransformationHistory() {
  const { transformationHistory, deleteTransformation, clearHistory, exportTransformations, isLoading } = useTransformationHistory();
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getTransformationIcon = (type: string) => {
    switch (type) {
      case 'summary': return FileText;
      case 'mindmap': return Brain;
      case 'podcast': return Headphones;
      case 'legal': return Scale;
      default: return FileText;
    }
  };

  const getTransformationLabel = (type: string) => {
    switch (type) {
      case 'summary': return 'Summary';
      case 'mindmap': return 'Mindmap';
      case 'podcast': return 'Podcast Script';
      case 'legal': return 'Legal Analysis';
      default: return 'Content';
    }
  };

  const filteredHistory = transformationHistory.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transformationType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || item.transformationType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewResult = (transformation: any) => {
    setSelectedResult({
      transformedContent: transformation.result.transformedContent,
      transformationType: transformation.transformationType,
      title: transformation.title,
      url: transformation.url,
      timestamp: transformation.timestamp,
      relatedQuestions: transformation.result.relatedQuestions,
    });
    setShowResults(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const transformationTypes = ['all', 'summary', 'mindmap', 'podcast', 'legal'];

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="font-black">
            <History className="w-4 h-4 mr-2" />
            HISTORY
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <History className="w-6 h-6" />
              TRANSFORMATION HISTORY
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transformations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 brutal-border"
                />
              </div>
              
              <Tabs value={filterType} onValueChange={setFilterType}>
                <TabsList className="brutal-border">
                  {transformationTypes.map(type => (
                    <TabsTrigger key={type} value={type} className="text-xs font-bold uppercase">
                      {type === 'all' ? 'ALL' : getTransformationLabel(type)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={exportTransformations}
                disabled={transformationHistory.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                EXPORT ALL
              </Button>
              <Button 
                variant="destructive" 
                onClick={clearHistory}
                disabled={transformationHistory.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                CLEAR ALL
              </Button>
            </div>

            {/* History list */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-bold text-muted-foreground">
                  {transformationHistory.length === 0 
                    ? 'NO TRANSFORMATIONS YET' 
                    : 'NO MATCHES FOUND'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {transformationHistory.length === 0 
                    ? 'Transform some content to see it here!'
                    : 'Try adjusting your search or filter.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-auto">
                {filteredHistory.map((transformation) => {
                  const Icon = getTransformationIcon(transformation.transformationType);
                  
                  return (
                    <Card key={transformation.id} className="brutal-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="bg-muted brutal-border p-2 flex-shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold truncate">{transformation.title}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {getTransformationLabel(transformation.transformationType)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(transformation.timestamp)}
                                </div>
                                {transformation.url && (
                                  <a
                                    href={transformation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-primary"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Source
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewResult(transformation)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTransformation(transformation.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Display Modal */}
      {showResults && selectedResult && (
        <ResultsDisplay 
          result={selectedResult}
          onClose={() => setShowResults(false)}
        />
      )}
    </>
  );
}