
"""
Pipeline base classes and interfaces.

This module defines the abstract base class (PipelineStage) and result class
(StageResult) that all pipeline stages must implement/use.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict
from dataclasses import dataclass, field

@dataclass
class StageResult:
    """
    Result returned by each pipeline stage.
    
    This is the "contract" that every stage must follow:
    - Return a StageResult object
    - Fill in all the required fields
    """
    
    stage_name: str                          
    success: bool                            
    data: Any                                
    metadata: Dict[str, Any] = field(default_factory=dict)  
    error: str | None = None                 


class PipelineStage(ABC):
    """
    Abstract base class for all pipeline stages.
    
    Every stage in the pipeline (preprocessing, OCR, AI, etc.) follows the same
    pattern:
    1. Receive input data
    2. Do some processing
    3. Return a StageResult
    """
    
    @abstractmethod
    async def execute(self, input_data: Any, job_id: str) -> StageResult:
        """
        Execute the stage.
        
        This is the main method that EVERY stage must implement.
        
        Args:
            input_data (Any):
                The input data for this stage.
                - For preprocessing: {"document_id": UUID, "minio_path": str}
                - For OCR: {"image": numpy_array, "...": ...}
                - For AI: {"text": str, "...": ...}
                
            job_id (str):
                The unique ID of the extraction job.
                This is used to find the job in the database and update it.
        
        Returns:
            StageResult:
                Must return a StageResult object with:
                - stage_name: Your stage name
                - success: True/False
                - data: Your result (will be passed to next stage)
                - metadata: Extra info (scores, quality, etc.)
                - error: Error message if success=False
        """
        pass
